import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { exigerRole } from '@/lib/acces';
import { base, schema } from '@/lib/db';
import { contexte, documents } from '@/lib/documents';
import { peutDeposer, peutLire } from '@/lib/droits';
import { Cadre, Message } from '../../../../composants/Cadre';
import { CarteDocument, choix } from '../../../../composants/Documents';
import { Depot } from '../../../../composants/Depot';

export const metadata: Metadata = { title: 'Pôle' };

export default async function Pole({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const a = await exigerRole('membre', 'admin');
  const { slug } = await params;
  const { ok, erreur } = await searchParams;
  const ctx = await contexte(a);
  const b = await base();
  const [p] = await b.select().from(schema.pole).where(eq(schema.pole.slug, slug));
  if (!p || !peutLire(ctx, { rattachement: 'pole', poleId: p.id, speakerId: null, sens: 'interne', creeParId: null })) notFound();
  const docs = await documents(ctx, { rattachement: 'pole', poleId: p.id });
  return (
    <Cadre acteur={a} actif="/espace/equipe/">
      <p className="cote"><Link href="/espace/equipe/">Équipe</Link> · Pôle</p>
      <h1>{p.nom}</h1>
      <Message ok={ok} erreur={erreur} />
      <div className="grille">
        {docs.map((d) => <CarteDocument key={d.id} d={d} ctx={ctx} retour={`/espace/equipe/poles/${slug}/`} />)}
        {peutDeposer(ctx, { rattachement: 'pole', poleId: p.id, sens: 'interne' }) && (
          <div className="carte"><p className="cote">Ajouter</p><Depot rattachement="pole" poleId={p.id} categories={choix(['document'])} titreLibre /></div>
        )}
      </div>
      {docs.length === 0 && <p className="muet">Aucun document dans ce pôle.</p>}
    </Cadre>
  );
}
