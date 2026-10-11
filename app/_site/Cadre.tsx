import type { ReactNode } from 'react';
import { EnTete, type Actif, type DateDuMenu } from './EnTete';
import { PiedDePage } from './PiedDePage';

// Le gabarit d'une page intérieure : lien d'évitement, en-tête et menu,
// filigrane de la dixième édition (couche fixe posée avant main, voir
// main-v8.js), contenu, pied de page.

export function FondMarque() {
  return (
    <div className="fond-marque" aria-hidden="true">
      <img src="/assets/img/logo-10e.svg" alt="" width="600" height="600" decoding="async" />
    </div>
  );
}

export function Cadre({ actif, date, children }: { actif?: Actif; date?: DateDuMenu; children: ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#contenu">Aller au contenu</a>
      <EnTete actif={actif} date={date} />
      <FondMarque />
      <main id="contenu">{children}</main>
      <PiedDePage />
    </>
  );
}
