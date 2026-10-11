import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { exigerSession } from '@/lib/acces';
import { contexte, documentLisible } from '@/lib/documents';
import { Cadre, Message } from '../../../composants/Cadre';
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
  const retour = d.rattachement === 'speaker'
    ? (a.role === 'speaker' ? '/espace/speaker/' : `/espace/equipe/speakers/${d.speakerId}/`)
    : d.rattachement === 'pole' ? '/espace/equipe/' : d.rattachement === 'commun' ? '/espace/equipe/commun/' : a.role === 'speaker' ? '/espace/speaker/' : '/espace/equipe/';
  return (
    <Cadre acteur={a}>
      <p className="cote"><Link href={retour}>Retour</Link></p>
      <h1>{d.titre}</h1>
      <Message ok={ok} erreur={erreur} />
      <CarteDocument d={d} ctx={ctx} retour={`/espace/documents/${d.id}/`} />
      <h2>Retours</h2>
      <Commentaires documentId={d.id} ctx={ctx} />
    </Cadre>
  );
}
