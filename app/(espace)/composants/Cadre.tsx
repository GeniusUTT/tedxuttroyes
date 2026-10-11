import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Acteur } from '@/lib/acces';
import { deconnexion } from '../espace/compte/actions';

// En-tête, navigation selon le rôle, pied avec la mention de licence.

export function Cadre({ acteur, actif, children, etroit }: { acteur?: Acteur | null; actif?: string; children: ReactNode; etroit?: boolean }) {
  const liens: [string, string][] = [];
  if (acteur?.role === 'speaker') liens.push(['/espace/speaker/', 'Mon dossier']);
  if (acteur && acteur.role !== 'speaker') liens.push(['/espace/equipe/', 'Équipe']);
  if (acteur?.role === 'admin') liens.push(['/espace/admin/', 'Administration']);
  if (acteur) liens.push(['/espace/compte/', 'Mon compte']);
  return (
    <>
      <header className="entete">
        <Link href="/espace/" className="marque">TEDx<span>UTTroyes</span><small>Espace</small></Link>
        {acteur && (
          <nav className="nav" aria-label="Espace">
            {liens.map(([href, txt]) => (
              <Link key={href} href={href} aria-current={actif === href ? 'page' : undefined}>{txt}</Link>
            ))}
            <form action={deconnexion}><button className="btn btn--sobre btn--petit" type="submit">Se déconnecter</button></form>
          </nav>
        )}
      </header>
      <main className={etroit ? 'etroit' : undefined}>{children}</main>
      <footer className="pied">
        <span>Cet événement TEDx indépendant est organisé sous licence de TED.</span>
        <span>Espace réservé à l’équipe et aux speakers. <a href="/mentions-legales/">Mentions légales</a></span>
      </footer>
    </>
  );
}

export function Message({ ok, erreur }: { ok?: string | null; erreur?: string | null }) {
  if (erreur) return <p className="message" role="alert">{erreur}</p>;
  if (ok) return <p className="message message--ok" role="status">{ok}</p>;
  return null;
}
