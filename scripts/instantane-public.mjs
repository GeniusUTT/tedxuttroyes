// Instantané du site public : statut, cible de redirection, empreinte du corps
// et en-têtes utiles de chaque URL, pour comparer deux déploiements.
//
//   node scripts/instantane-public.mjs capture <url-de-base> <racine-des-fichiers> <sortie.json>
//   node scripts/instantane-public.mjs compare <avant.json> <apres.json>
//
// Accès aux prévisualisations protégées : VERCEL_AUTOMATION_BYPASS_SECRET
// (en-tête de contournement) ou VERCEL_SHARE (jeton _vercel_share d'un lien
// de partage). La liste des URL se déduit des fichiers de la racine, plus la
// table des redirections héritée du .htaccess et quelques adresses absentes.

import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const EXCLUS = new Set(['.git', '.claude', '.agents', 'node_modules', 'migration', 'marque-2027', 'scripts', 'tests', 'app', 'lib', 'drizzle', '.next', '.vercel']);
const FICHIERS_EXCLUS = /^(README|CLAUDE|SECURITY)\.md$|^\.|^package(-lock)?\.json$|^vercel\.json$|^skills-lock\.json$|\.(ts|tsx|mjs)$|^tsconfig/;

const REDIRECTIONS = [
  '/billetterie.html', '/contact.html', '/detail_localisation.html',
  '/tous-les-speakers.html', '/toutes-les-editions.html',
  '/speakers/2019/speaker-2019.html', '/speakers/2016/speaker-2016.html',
  '/images/logo-black.png', '/images/edition-2026/logo_genius.png',
  '/index.html', '/faq/index.html', '/speakers/2019/alexandre-dana/index.html',
  '/editions/edition-2016.html', '/speakers/2019/alexandre-dana.html', '/faq.html',
  '/faq', '/editions', '/speakers/2019/alexandre-dana',
];
const ABSENTES = [
  '/nexiste-pas/', '/nexiste-pas', '/editions/edition-2018/', '/tedx-utt-10ans/',
  '/CLAUDE.md', '/README.md', '/SECURITY.md', '/.htaccess', '/.gitignore',
  '/package.json', '/vercel.json', '/marque-2027/', '/migration/', '/.env', '/.env.local',
];
const ENTETES = ['content-type', 'cache-control', 'x-frame-options', 'x-content-type-options', 'referrer-policy', 'x-robots-tag', 'set-cookie'];

async function lister(racine, dossier = racine, sortie = []) {
  for (const e of await readdir(dossier, { withFileTypes: true })) {
    const chemin = join(dossier, e.name);
    if (e.isDirectory()) {
      if (!EXCLUS.has(e.name)) await lister(racine, chemin, sortie);
    } else if (!FICHIERS_EXCLUS.test(e.name)) {
      const rel = '/' + relative(racine, chemin).split(sep).join('/');
      sortie.push(rel.endsWith('/index.html') ? rel.slice(0, -'index.html'.length) : rel);
    }
  }
  return sortie;
}

async function cookieDePartage(base) {
  if (!process.env.VERCEL_SHARE) return '';
  const r = await fetch(`${base}/?_vercel_share=${process.env.VERCEL_SHARE}`, { redirect: 'manual' });
  return (r.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).join('; ');
}

async function capture(base, racine, sortie) {
  base = base.replace(/\/$/, '');
  const urls = [...new Set([...(await lister(racine)), ...REDIRECTIONS, ...ABSENTES])].sort();
  const entetes = {};
  if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) entetes['x-vercel-protection-bypass'] = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  const cookie = await cookieDePartage(base);
  if (cookie) entetes.cookie = cookie;
  const resultat = {};
  let i = 0;
  async function suivant() {
    while (i < urls.length) {
      const u = urls[i++];
      const r = await fetch(base + encodeURI(u), { redirect: 'manual', headers: entetes });
      const corps = Buffer.from(await r.arrayBuffer());
      const h = {};
      for (const k of ENTETES) if (r.headers.has(k)) h[k] = r.headers.get(k);
      resultat[u] = {
        statut: r.status,
        cible: (r.headers.get('location') ?? '').replace(base, '').replace(/^https:\/\/[^/]+\.vercel\.app/, ''),
        empreinte: r.status >= 300 && r.status < 400 ? '' : createHash('sha256').update(corps).digest('hex'),
        taille: corps.length,
        entetes: h,
      };
    }
  }
  await Promise.all(Array.from({ length: 8 }, suivant));
  await writeFile(sortie, JSON.stringify(resultat, null, 1));
  const parStatut = {};
  for (const v of Object.values(resultat)) parStatut[v.statut] = (parStatut[v.statut] ?? 0) + 1;
  console.log(`${urls.length} URL relevées`, parStatut);
}

async function compare(a, b) {
  const avant = JSON.parse(await readFile(a, 'utf8'));
  const apres = JSON.parse(await readFile(b, 'utf8'));
  let ecarts = 0;
  for (const u of [...new Set([...Object.keys(avant), ...Object.keys(apres)])].sort()) {
    const x = avant[u], y = apres[u];
    const diff = [];
    if (!x || !y) diff.push(x ? 'absente après' : 'absente avant');
    else {
      for (const k of ['statut', 'cible', 'empreinte']) if (x[k] !== y[k]) diff.push(`${k} : ${x[k]} => ${y[k]}`);
      for (const k of ENTETES) if (k !== 'set-cookie' && (x.entetes[k] ?? '') !== (y.entetes[k] ?? '')) diff.push(`${k} : ${x.entetes[k] ?? '(absent)'} => ${y.entetes[k] ?? '(absent)'}`);
      if (y.entetes['set-cookie']) diff.push('cookie déposé après');
    }
    if (diff.length) { ecarts++; console.log(u, '\n  ' + diff.join('\n  ')); }
  }
  console.log(ecarts ? `${ecarts} URL en écart` : 'Aucun écart.');
  process.exit(ecarts ? 1 : 0);
}

const [mode, ...args] = process.argv.slice(2);
if (mode === 'capture') await capture(...args);
else if (mode === 'compare') await compare(...args);
else { console.error('usage : capture <base> <racine> <sortie> | compare <avant> <apres>'); process.exit(2); }
