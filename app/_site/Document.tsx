import type { ReactNode } from 'react';
import { preload } from 'react-dom';
import { ScriptsDuSite } from './ScriptsDuSite';

// Le document commun du site public : polices hébergées sur le site, la
// feuille unique, la classe js posée avant le premier rendu, la mesure
// d'audience en bas de page. La balise <html> reçoit des classes de scripts
// en ligne (js, voile-on, interlude-off) avant que React ne l'hydrate : d'où
// suppressHydrationWarning, qui ne vaut que pour elle.

const POLICES = [
  '/assets/fonts/bricolage-var-latin.woff2',
  '/assets/fonts/dm-sans-var-latin.woff2',
  '/assets/fonts/space-mono-400-latin.woff2',
];

export function Document({
  corps,
  scripts,
  enTete,
  children,
}: {
  corps: 'parcours' | 'journey';
  scripts: readonly string[];
  // Des scripts en ligne de plus, joués avant le premier rendu (l'accueil
  // décide là du voile et de l'interlude).
  enTete?: ReactNode;
  children: ReactNode;
}) {
  // Par l'API de React, pas par une balise : une balise <link rel="preload">
  // écrite à la main sort deux fois, React ajoutant la sienne.
  for (const p of POLICES) preload(p, { as: 'font', type: 'font/woff2', crossOrigin: '' });
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/assets/img/favicon-10e.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/favicon-10e.png" />
        <link rel="apple-touch-icon" href="/assets/img/webclip-10e.png" />
        <link rel="stylesheet" href="/assets/css/main-v14.css" />
        <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.classList.add("js");' }} />
        {enTete}
      </head>
      <body className={corps}>
        {children}
        <ScriptsDuSite sources={scripts} />
        <script
          dangerouslySetInnerHTML={{
            __html: 'window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };',
          }}
        />
        <script defer src="/_vercel/insights/script.js" />
      </body>
    </html>
  );
}
