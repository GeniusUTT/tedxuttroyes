import type { NextConfig } from 'next';
import { BILLETTERIE } from './app/_site/liens';

// Next.js sert tout le site : les pages publiques (app/(accueil)/,
// app/(pages)/) et l'espace connecté (app/(espace)/). public/ ne garde que les
// fichiers statiques. Les redirections et les en-têtes reprennent l'ancien
// .htaccess d'OVH.

const config: NextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  // Une seule 404 pour tout le site, pages publiques et espace : voir
  // app/global-not-found.tsx.
  experimental: { globalNotFound: true },
  serverExternalPackages: ['@electric-sql/pglite'],
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
