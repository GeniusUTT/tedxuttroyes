import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { exigerSession } from '@/lib/acces';
import { categorie } from '@/lib/categories';
import { contexte, documentLisible } from '@/lib/documents';
import { Cadre, Message, Section } from '../../../composants/Cadre';
import { CarteDocument } from '../../../composants/Documents';
import { Commentaires } from '../../../composants/Commentaires';

export const metadata: Metadata = { title: 'Document' };

export default async function Document({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const a = await exigerSession();
  const { id } = await params;
  const { ok, erreur } = await searchParams;
  const ctx = await contexte(a);
  const d = await documentLisible(ctx, id);
  if (!d) notFound();
  const retour = a.role === 'speaker' ? '/espace/speaker/' : d.rattachement === 'speaker' ? `/espace/equipe/speakers/${d.speakerId}/` : '/espace/equipe/';
  return (
    <Cadre
      acteur={a}
      cote={<Link href={retour}>{a.role === 'speaker' ? 'Mon dossier' : 'Retour au dossier'}</Link>}
      titre={d.titre}
      chapo={categorie(d.categorie)?.libelle}
      avant={<Message ok={ok} erreur={erreur} />}
    >
      <Section cote="Fichier">
        <CarteDocument d={d} ctx={ctx} retour={`/espace/documents/${d.id}/`} signer={!!categorie(d.categorie)?.modele} />
      </Section>
      <Section cote="Retours" titre="Retours" alt>
        <Commentaires documentId={d.id} ctx={ctx} doc={d} />
      </Section>
    </Cadre>
  );
}
