import type { Viewport } from 'next';
import type { ReactNode } from 'react';
import { Document } from '../_site/Document';
import { SCRIPTS } from '../_site/liens';

// L'accueil : son propre layout racine, pour la classe journey (la ligne
// continue en défilement virtuel), la carte et les deux décisions prises
// avant le premier rendu.
export const dynamic = 'force-static';

export const viewport: Viewport = { themeColor: '#080808' };

const scripts = [SCRIPTS.devoilement, SCRIPTS.principal, SCRIPTS.ligne, SCRIPTS.carte];

// Le voile d'ouverture : joué une fois par session, en version courte si
// l'animation complète a déjà été vue, jamais en mouvement réduit. Rien ne
// peut le laisser coincé : la sortie est une animation CSS.
const VOILE =
  'try { if (!sessionStorage.getItem("tedx-ouverture") && !matchMedia("(prefers-reduced-motion: reduce)").matches) { var v = document.documentElement; v.classList.add("voile-on"); if (localStorage.getItem("tedx-ouverture-vue")) { v.classList.add("voile-court") } sessionStorage.setItem("tedx-ouverture", "1"); localStorage.setItem("tedx-ouverture-vue", "1") } } catch (e) { }';

// L'interlude : sauté pendant vingt-quatre heures après avoir été vu. La
// décision se prend au chargement, jamais en cours de route.
const INTERLUDE =
  'try { var iv = +localStorage.getItem("tedx-interlude-vu"); if (iv && Date.now() - iv < 864e5) { document.documentElement.classList.add("interlude-off") } } catch (e) { }';

export default function Accueil({ children }: { children: ReactNode }) {
  return (
    <Document
      corps="journey"
      scripts={scripts}
      enTete={
        <>
          <script dangerouslySetInnerHTML={{ __html: VOILE }} />
          <script dangerouslySetInnerHTML={{ __html: INTERLUDE }} />
        </>
      }
    >
      {children}
    </Document>
  );
}
