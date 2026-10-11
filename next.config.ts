import { globSync } from 'node:fs';
import { sep } from 'node:path';
import type { NextConfig } from 'next';

// Le site public passe à Next.js page par page (app/(pages)/) ; celles qui
// restent écrites à la main vivent dans public/ et sont servies telles
// quelles. Les redirections et les en-têtes reprennent l'ancien .htaccess.

const BILLETTERIE = 'https://www.billetweb.fr/tedxuttroyes-2027-10e-edition';

// Les pages encore écrites à la main dans public/, servies telles quelles le
// temps du passage à Next : une réécriture chacune, et seulement pour elles.
// Une règle générale enverrait aussi vers un index.html inexistant les pages
// que Next précalcule (fiches speakers, éditions), avant qu'il ne les trouve.
const PAGES_HTML = globSync('public/**/index.html', { exclude: ['public/assets/**'] })
  .map((f) => f.split(sep).join('/').replace(/^public/, '').replace(/index\.html$/, ''));

const config: NextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  serverExternalPackages: ['@electric-sql/pglite'],
  outputFileTracingIncludes: {
    '/[...introuvable]': ['./public/404.html'],
  },
  // Les fonctions n'ont besoin d'aucun asset public : sans cette exclusion,
  // les vidéos et les images partiraient dans chaque fonction.
  outputFileTracingExcludes: {
    '*': ['./public/assets/**', './migration/**', './.e2e-*/**', './.tests-*/**', './.stockage-local/**', './.pglite*/**'],
  },
  async redirects() {
    const r = (source: string, destination: string) => ({ source, destination, statusCode: 301 as const });
    return [
      r('/images/edition-2026/logo_genius.png', '/assets/img/partenaires/logo-genius-utt.webp'),
      r('/images/logo-black.png', '/assets/img/logo-black.png'),
      r('/billetterie.html', BILLETTERIE),
      r('/contact.html', '/faq/'),
      r('/detail_localisation.html', '/'),
      r('/tous-les-speakers.html', '/speakers/'),
      r('/toutes-les-editions.html', '/editions/'),
      r('/speakers/:annee([0-9][0-9][0-9][0-9])/:fichier(speaker-[0-9][0-9][0-9][0-9]).html', '/editions/edition-:annee/'),
      r('/index.html', '/'),
      r('/:chemin*/index.html', '/:chemin*/'),
      r('/:chemin((?!404\.html$).+).html', '/:chemin/'),
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: PAGES_HTML.map((chemin) => ({ source: chemin, destination: `${chemin}index.html` })),
      fallback: [],
    };
  },
  async headers() {
    return [
      {
        source: '/:chemin*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
      {
        // L'espace : jamais indexé, jamais mis en cache, jamais encadré.
        source: '/espace/:chemin*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'Cache-Control', value: 'private, no-store' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
      {
        source: '/assets/:fichier*.:ext(woff2|png|webp|jpg|jpeg|svg)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000' }],
      },
      {
        source: '/assets/:fichier*.:ext(css|js)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000' }],
      },
      {
        source: '/assets/agenda/:fichier*.ics',
        headers: [{ key: 'Content-Type', value: 'text/calendar; charset=utf-8' }],
      },
    ];
  },
};

export default config;
