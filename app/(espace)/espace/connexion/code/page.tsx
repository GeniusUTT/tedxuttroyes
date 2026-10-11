import type { Metadata } from 'next';
import { REPONSE_DEMANDE } from '@/lib/connexion';
import { Cadre } from '../../../composants/Cadre';
import { FormulaireCode } from './Formulaire';

export const metadata: Metadata = { title: 'Code de connexion' };

// Le lien de l'e-mail mène ici avec l'adresse et le code déjà remplis : la
// connexion ne se fait qu'au clic, une messagerie qui ouvre le lien pour
// l'analyser ne consomme donc rien.
export default async function Code({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const p = await searchParams;
  const code = /^\d{6}$/.test(p.code ?? '') ? p.code! : '';
  return (
    <Cadre etroit>
      <p className="cote">Espace connecté</p>
      <h1>Votre code</h1>
      {p.envoye && <p className="message message--ok" role="status">{REPONSE_DEMANDE}</p>}
      {code && <p className="chapo">Vérifiez l’adresse, puis cliquez sur « Se connecter ».</p>}
      <FormulaireCode email={p.email ?? ''} code={code} />
      <p className="muet" style={{ marginTop: 24 }}>Pas de code ? Vérifiez vos indésirables, ou <a href="/espace/connexion/">demandez-en un nouveau</a>.</p>
    </Cadre>
  );
}
