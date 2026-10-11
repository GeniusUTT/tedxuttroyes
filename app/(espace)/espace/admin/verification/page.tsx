import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import QRCode from 'qrcode';
import { exigerRole } from '@/lib/acces';
import { etat, preparer } from '@/lib/second-facteur';
import { Bouton } from '../../../composants/Bouton';
import { Cadre, Message } from '../../../composants/Cadre';
import { actionValider } from './actions';

export const metadata: Metadata = { title: 'Second facteur' };

export default async function Verification({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const a = await exigerRole('admin');
  if (a.totpValide) redirect('/espace/admin/');
  const { erreur } = await searchParams;
  const e = await etat(a.id);
  const enrolement = e !== 'actif' ? await preparer(a.id, a.email) : null;
  const qr = enrolement ? await QRCode.toDataURL(enrolement.uri, { margin: 0, width: 440 }) : null;
  return (
    <Cadre acteur={a} actif="/espace/admin/" etroit>
      <p className="cote">Administration</p>
      <h1>Second facteur</h1>
      <Message erreur={erreur} />
      {enrolement ? (
        <>
          <p className="chapo">Un admin voit tous les dossiers : son accès est protégé par une application d’authentification (Google Authenticator, Microsoft Authenticator, 2FAS, Aegis…).</p>
          <ol>
            <li>Scannez ce code avec l’application.</li>
            <li>Saisissez le code à six chiffres qu’elle affiche.</li>
          </ol>
          <div className="qr"><img src={qr!} alt="Code QR à scanner avec l’application d’authentification" /></div>
          <details><summary>Saisie manuelle de la clé</summary><code className="secret">{enrolement.secret}</code></details>
        </>
      ) : (
        <p className="chapo">Saisissez le code affiché par votre application d’authentification.</p>
      )}
      <form action={actionValider} style={{ marginTop: 20 }}>
        <div className="champ">
          <label htmlFor="code">Code à six chiffres</label>
          <input id="code" name="code" type="text" className="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} required autoFocus />
        </div>
        <Bouton>Valider</Bouton>
      </form>
      <p className="muet" style={{ marginTop: 24 }}>Appareil perdu ? Un autre admin ne peut pas réinitialiser votre second facteur depuis l’interface : la procédure de secours est décrite dans le README du dépôt.</p>
    </Cadre>
  );
}
