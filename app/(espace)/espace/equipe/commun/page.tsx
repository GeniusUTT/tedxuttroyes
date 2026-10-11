import type { Metadata } from 'next';
import Link from 'next/link';
import { exigerRole } from '@/lib/acces';
import { contexte, documents } from '@/lib/documents';
import { peutDeposer } from '@/lib/droits';
import { Cadre, Message } from '../../../composants/Cadre';
import { CarteDocument, choix } from '../../../composants/Documents';
import { Depot } from '../../../composants/Depot';

export const metadata: Metadata = { title: 'Espace commun' };

export default async function Commun({ searchParams }: { searchParams: Promise<{ ok?: string; erreur?: string }> }) {
  const a = await exigerRole('membre', 'admin');
  const { ok, erreur } = await searchParams;
  const ctx = await contexte(a);
  const docs = await documents(ctx, { rattachement: 'commun' });
  return (
    <Cadre acteur={a} actif="/espace/equipe/">
      <p className="cote"><Link href="/espace/equipe/">Équipe</Link> · Espace commun</p>
      <h1>Espace commun</h1>
      <Message ok={ok} erreur={erreur} />
      <div className="grille">
        {docs.map((d) => <CarteDocument key={d.id} d={d} ctx={ctx} retour="/espace/equipe/commun/" />)}
        {peutDeposer(ctx, { rattachement: 'commun', sens: 'interne' }) && (
          <div className="carte"><p className="cote">Ajouter</p><Depot rattachement="commun" categories={choix(['document'])} titreLibre /></div>
        )}
      </div>
      {docs.length === 0 && <p className="muet">Aucun document pour l’instant.</p>}
    </Cadre>
  );
}
