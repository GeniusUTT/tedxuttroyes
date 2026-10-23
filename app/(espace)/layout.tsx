import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { preload } from 'react-dom';
import { ScriptsDuSite } from '../_site/ScriptsDuSite';
import { SCRIPTS } from '../_site/liens';
import './espace.css';

// L'espace connecté est une rubrique du site, pas un second site : même
// feuille (main-v15.css), mêmes polices, même en-tête, même filigrane, même
// pied de page, même dorsale rouge. espace.css n'ajoute que ce que le site
// public n'a pas (champs, tableaux, dépôt). Un seul script du site,
// main-v9.js (en-tête au défilement, menu mobile, filigrane) ; jamais
// line-v10.js, la dorsale reste la ligne statique du CSS. Pas de mesure
// d'audience : ces pages sont privées.

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { default: 'Espace TEDxUTTroyes', template: '%s | Espace TEDxUTTroyes' },
  robots: { index: false, follow: false, nocache: true },
  icons: { icon: '/assets/img/favicon-10e.svg', apple: '/assets/img/webclip-10e.png' },
};

export const viewport: Viewport = { themeColor: '#080808', colorScheme: 'dark' };

const POLICES = [
  '/assets/fonts/bricolage-var-latin.woff2',
  '/assets/fonts/dm-sans-var-latin.woff2',
  '/assets/fonts/space-mono-400-latin.woff2',
];

const scripts = [SCRIPTS.principal];

export default function Racine({ children }: { children: ReactNode }) {
  for (const p of POLICES) preload(p, { as: 'font', type: 'font/woff2', crossOrigin: '' });
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/assets/css/main-v15.css" precedence="site" />
        <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.classList.add("js");' }} />
      </head>
      <body className="espace">
        {children}
        <ScriptsDuSite sources={scripts} />
      </body>
    </html>
  );
}
