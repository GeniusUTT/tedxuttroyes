// Réglage des seaux Scaleway, à lancer une fois avec la clé de stockage :
//
//   npx tsx --env-file=.env.local scripts/stockage-config.ts
//
// Seau des documents : CORS (envoi direct depuis le navigateur), versionnage
// (une suppression par erreur se rattrape), effacement des versions
// remplacées au bout de 30 jours. Seau des sauvegardes : effacement au bout
// de 30 jours. Les noms viennent de S3_BUCKET, S3_BUCKET_PREVIEW et
// S3_BUCKET_SAUVEGARDES.

import { CreateBucketCommand, HeadBucketCommand, PutBucketCorsCommand, PutBucketLifecycleConfigurationCommand, PutBucketVersioningCommand, S3Client } from '@aws-sdk/client-s3';

const client = new S3Client({
  region: process.env.S3_REGION ?? 'fr-par',
  endpoint: process.env.S3_ENDPOINT ?? 'https://s3.fr-par.scw.cloud',
  credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '', secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '' },
});

async function seau(nom: string) {
  try {
    await client.send(new HeadBucketCommand({ Bucket: nom }));
  } catch {
    await client.send(new CreateBucketCommand({ Bucket: nom }));
    console.info(`seau créé : ${nom}`);
  }
}

async function documents(nom: string, origines: string[]) {
  await seau(nom);
  await client.send(new PutBucketCorsCommand({ Bucket: nom, CORSConfiguration: { CORSRules: [{ AllowedOrigins: origines, AllowedMethods: ['POST'], AllowedHeaders: ['*'], MaxAgeSeconds: 3600 }] } }));
  await client.send(new PutBucketVersioningCommand({ Bucket: nom, VersioningConfiguration: { Status: 'Enabled' } }));
  await client.send(new PutBucketLifecycleConfigurationCommand({ Bucket: nom, LifecycleConfiguration: { Rules: [
    { ID: 'versions-remplacees', Status: 'Enabled', Filter: { Prefix: '' }, NoncurrentVersionExpiration: { NoncurrentDays: 30 } },
  ] } }));
  console.info(`documents : ${nom} (CORS ${origines.join(', ')}, versionnage, 30 jours pour les versions remplacées)`);
}

async function principal() {
  const prod = process.env.S3_BUCKET, preview = process.env.S3_BUCKET_PREVIEW, sauvegardes = process.env.S3_BUCKET_SAUVEGARDES;
  if (prod) await documents(prod, ['https://tedxuttroyes.fr']);
  if (preview) await documents(preview, ['https://*-ted-x-uttroyes.vercel.app', 'http://localhost:3000']);
  if (sauvegardes) {
    await seau(sauvegardes);
    await client.send(new PutBucketLifecycleConfigurationCommand({ Bucket: sauvegardes, LifecycleConfiguration: { Rules: [
      { ID: 'trente-jours', Status: 'Enabled', Filter: { Prefix: '' }, Expiration: { Days: 30 } },
    ] } }));
    console.info(`sauvegardes : ${sauvegardes} (30 jours)`);
  }
}

principal().then(() => process.exit(0), (e) => { console.error(e); process.exit(1); });
