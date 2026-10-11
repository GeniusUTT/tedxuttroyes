import { DeleteObjectCommand, GetObjectCommand, HeadObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { disposition, type FormulaireEnvoi, type Stockage } from './index';

// Pilote S3 (Scaleway Object Storage, région fr-par). L'envoi passe par un
// POST présigné : la taille maximale et le type sont des conditions de la
// politique signée, le stockage refuse lui-même ce qui en sort.

export class StockageS3 implements Stockage {
  private client: S3Client;
  private seau: string;

  constructor(seau = process.env.S3_BUCKET) {
    if (!seau) throw new Error('S3_BUCKET manquant');
    this.seau = seau;
    this.client = new S3Client({
      region: process.env.S3_REGION ?? 'fr-par',
      endpoint: process.env.S3_ENDPOINT ?? 'https://s3.fr-par.scw.cloud',
      credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '', secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '' },
    });
  }

  async formulaireEnvoi(cle: string, typeMime: string, tailleMax: number, dureeS: number): Promise<FormulaireEnvoi> {
    const { url, fields } = await createPresignedPost(this.client, {
      Bucket: this.seau,
      Key: cle,
      Conditions: [['content-length-range', 1, tailleMax], ['eq', '$Content-Type', typeMime]],
      Fields: { 'Content-Type': typeMime },
      Expires: dureeS,
    });
    return { url, champs: fields };
  }

  async infos(cle: string) {
    try {
      const r = await this.client.send(new HeadObjectCommand({ Bucket: this.seau, Key: cle }));
      return { taille: r.ContentLength ?? 0 };
    } catch {
      return null;
    }
  }

  async debut(cle: string, octets: number) {
    const r = await this.client.send(new GetObjectCommand({ Bucket: this.seau, Key: cle, Range: `bytes=0-${octets - 1}` }));
    return new Uint8Array(await r.Body!.transformToByteArray());
  }

  async lire(cle: string) {
    const r = await this.client.send(new GetObjectCommand({ Bucket: this.seau, Key: cle }));
    return new Uint8Array(await r.Body!.transformToByteArray());
  }

  async ecrire(cle: string, corps: Uint8Array, typeMime: string) {
    await this.client.send(new PutObjectCommand({ Bucket: this.seau, Key: cle, Body: corps, ContentType: typeMime }));
  }

  async urlLecture(cle: string, nomFichier: string, typeMime: string, dureeS: number) {
    return getSignedUrl(this.client, new GetObjectCommand({
      Bucket: this.seau,
      Key: cle,
      ResponseContentDisposition: disposition(nomFichier),
      ResponseContentType: typeMime,
      ResponseCacheControl: 'private, no-store',
    }), { expiresIn: dureeS });
  }

  async supprimer(cle: string) {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.seau, Key: cle }));
  }

  async lister(prefixe: string) {
    const sortie: { cle: string; date: Date }[] = [];
    let jeton: string | undefined;
    do {
      const r = await this.client.send(new ListObjectsV2Command({ Bucket: this.seau, Prefix: prefixe, ContinuationToken: jeton }));
      for (const o of r.Contents ?? []) if (o.Key) sortie.push({ cle: o.Key, date: o.LastModified ?? new Date(0) });
      jeton = r.IsTruncated ? r.NextContinuationToken : undefined;
    } while (jeton);
    return sortie;
  }
}
