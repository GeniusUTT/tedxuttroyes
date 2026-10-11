// Compare le site public entre une référence et une version candidate, page
// par page : en-tête (titre, meta, liens, JSON-LD), structure du corps
// (balises, attributs, texte) et géométrie (la boîte de chaque élément, à
// plusieurs largeurs). Sert au passage du HTML écrit à la main à Next.js : on
// ne peut plus comparer octet pour octet, on compare ce que le navigateur voit.
//
//   node scripts/comparer-public.mjs <url-reference> <url-candidate> [chemin...]
//
// Une prévisualisation Vercel protégée se passe avec VERCEL_SHARE, le jeton
// _vercel_share d'un lien de partage.
//
// Un chemin de la forme « candidat|reference » compare deux adresses
// différentes : la 404 de Next contre le 404.html d'origine, par exemple.
//
// Sans chemin, toutes les URL de public/sitemap.xml, plus la page cachée et
// une adresse inconnue pour la 404. Les scripts de la page sont coupés : on
// compare ce que le serveur envoie, pas ce que les scripts en font (les
// sondes de la ligne et du dévoilement s'en chargent). Les écarts sont écrits
// dans .comparaison-public/, un fichier par page, par largeur et par aspect.

import { chromium } from '@playwright/test';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';

const [reference, candidate, ...demandes] = process.argv.slice(2);
if (!reference || !candidate) {
  console.error('usage : node scripts/comparer-public.mjs <url-reference> <url-candidate> [chemin...]');
  process.exit(2);
}

const LARGEURS = [375, 1280, 1920];
const SORTIE = '.comparaison-public';

async function chemins() {
  if (demandes.length) return demandes;
  const plan = await readFile('public/sitemap.xml', 'utf8');
  const liste = [...plan.matchAll(/<loc>https:\/\/tedxuttroyes\.fr([^<]*)<\/loc>/g)].map((m) => m[1]);
  return [...liste, '/tedx-utt-10e/', '/adresse-qui-n-existe-pas/|/404.html'];
}

// Exécuté dans la page. Tout ce que Next ajoute de lui-même (ses scripts, ses
// liens vers /_next/, ses marqueurs de flux) est écarté : la comparaison
// porte sur le contenu.
function extraire() {
  const deNext = (el) => {
    if (el.tagName === 'SCRIPT') {
      const src = el.getAttribute('src') ?? '';
      // Les scripts du site ne sont plus dans le HTML : ScriptsDuSite les
      // injecte après l'hydratation. Leur chargement se vérifie page vivante.
      return src.startsWith('/_next/') || src.startsWith('/assets/js/') || /self\.__next|__next_f|TURBOPACK/.test(el.textContent ?? '');
    }
    // React précharge de lui-même la feuille et les premières images : le
    // site d'origine n'en préchargeait aucune, ce n'est pas du contenu.
    if (el.tagName === 'LINK') {
      const as = el.getAttribute('as');
      return (el.getAttribute('href') ?? '').startsWith('/_next/') || (el.rel === 'preload' && (as === 'image' || as === 'style'));
    }
    // Le réceptacle vide où Next diffuse les métadonnées.
    if (el.tagName === 'DIV' && el.hidden && el.parentElement === document.body && !el.textContent.trim()) return true;
    if (el.tagName === 'NEXT-ROUTE-ANNOUNCER') return true;
    if (el.tagName === 'TEMPLATE' && el.hasAttribute('data-dgst')) return true;
    return false;
  };
  // Les liens vers la billetterie ouvrent tous un nouvel onglet depuis le
  // passage à Next ; l'ancien site le faisait sur certaines pages seulement.
  const billetterie = (el) => el.tagName === 'A' && (el.getAttribute('href') ?? '').startsWith('https://www.billetweb.fr/');
  const attributs = (el) => [...el.attributes]
    .filter((a) => !(billetterie(el) && (a.name === 'target' || a.name === 'rel')))
    .map((a) => {
      let v = a.value;
      if (a.name === 'style') v = el.style.cssText;
      if (a.name === 'class') v = v.trim().split(/\s+/).join(' ');
      return `${a.name}=${JSON.stringify(v)}`;
    })
    .sort()
    .join(' ');

  const tete = [];
  tete.push(`title ${JSON.stringify(document.title)}`);
  tete.push(`html ${attributs(document.documentElement)}`);
  for (const m of document.head.querySelectorAll('meta')) {
    const cle = m.getAttribute('name') ?? m.getAttribute('property') ?? m.getAttribute('http-equiv') ?? (m.hasAttribute('charset') ? 'charset' : '?');
    tete.push(`meta ${cle} ${JSON.stringify(m.getAttribute('content') ?? m.getAttribute('charset'))}`);
  }
  for (const l of document.querySelectorAll('link')) {
    if (deNext(l)) continue;
    tete.push(`link ${attributs(l)}`);
  }
  for (const s of document.querySelectorAll('script')) {
    if (deNext(s)) continue;
    if (s.type === 'application/ld+json') {
      const trier = (v) => Array.isArray(v) ? v.map(trier) : v && typeof v === 'object'
        ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, trier(v[k])])) : v;
      tete.push(`json-ld ${JSON.stringify(trier(JSON.parse(s.textContent)))}`);
    } else {
      tete.push(`script ${attributs(s)} ${JSON.stringify((s.textContent ?? '').replace(/\s+/g, ' ').trim())}`);
    }
  }
  tete.sort();

  const corps = [];
  const boites = [];
  const parcourir = (el, profondeur) => {
    if (deNext(el)) return;
    const indent = '  '.repeat(profondeur);
    if (el.tagName === 'SCRIPT') {
      // Les données structurées sont comparées avec la tête, où qu'elles soient.
      if (el.type === 'application/ld+json') return;
      corps.push(`${indent}<script ${attributs(el)}> ${JSON.stringify((el.textContent ?? '').replace(/\s+/g, ' ').trim())}`);
      return;
    }
    const r = el.getBoundingClientRect();
    corps.push(`${indent}<${el.tagName.toLowerCase()} ${attributs(el)}>`);
    boites.push(`${indent}${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${el.classList.length ? '.' + [...el.classList].join('.') : ''} ${Math.round(r.left)},${Math.round(r.top + window.scrollY)} ${Math.round(r.width)}x${Math.round(r.height)}`);
    const racine = el.tagName === 'TEMPLATE' ? el.content : el;
    // React sépare deux morceaux de texte voisins par un commentaire vide :
    // le texte se recolle jusqu'au prochain élément, comme à l'écran.
    let texte = '';
    const vider = () => {
      const t = texte.replace(/\s+/g, ' ').trim();
      if (t) corps.push(`${indent}  "${t}"`);
      texte = '';
    };
    for (const n of racine.childNodes) {
      if (n.nodeType === Node.TEXT_NODE) {
        texte += n.textContent;
      } else if (n.nodeType === Node.ELEMENT_NODE) {
        vider();
        parcourir(n, profondeur + 1);
      }
    }
    vider();
  };
  parcourir(document.body, 0);
  return { tete: tete.join('\n') + '\n', corps: corps.join('\n') + '\n', boites: boites.join('\n') + '\n' };
}

function nom(chemin) {
  return chemin.split('|')[0].replace(/^\/|\/$/g, '').replace(/\//g, '__') || 'accueil';
}

function ecart(a, b) {
  try {
    execFileSync('git', ['diff', '--no-index', '--no-color', '--unified=2', a, b], { encoding: 'utf8' });
    return '';
  } catch (e) {
    return e.stdout ?? String(e);
  }
}

const navigateur = await chromium.launch();
await rm(SORTIE, { recursive: true, force: true });
let pagesEnEcart = 0;
const liste = await chemins();

for (const chemin of liste) {
  const rapports = [];
  for (const largeur of LARGEURS) {
    const vues = {};
    const [cheminNew, cheminRef = cheminNew] = chemin.split('|');
    for (const [cote, url] of [['ref', reference + cheminRef], ['new', candidate + cheminNew]]) {
      const contexte = await navigateur.newContext({ javaScriptEnabled: false, viewport: { width: largeur, height: 900 } });
      const page = await contexte.newPage();
      // Prévisualisation protégée : le jeton d'un lien de partage pose le
      // cookie d'accès dans ce contexte, puis on va à la page.
      if (process.env.VERCEL_SHARE && /\.vercel\.app/.test(url)) {
        await page.goto(`${new URL(url).origin}/?_vercel_share=${process.env.VERCEL_SHARE}`);
      }
      const reponse = await page.goto(url, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      // Les animations d'entrée sont menées à leur terme : mesurées en cours
      // de route, elles donneraient une position différente à chaque essai.
      // Une animation sans fin (les pulsations) refuse finish() : on la laisse.
      await page.evaluate(() => document.getAnimations().forEach((a) => { try { a.finish(); } catch { /* sans fin */ } }));
      vues[cote] = { statut: reponse?.status(), ...(await page.evaluate(extraire)) };
      await contexte.close();
    }
    const dossier = join(SORTIE, nom(chemin), String(largeur));
    await mkdir(dossier, { recursive: true });
    const aspects = largeur === LARGEURS[0] ? ['tete', 'corps', 'boites'] : ['boites'];
    if (vues.ref.statut !== vues.new.statut) rapports.push(`statut ${vues.ref.statut} -> ${vues.new.statut}`);
    for (const aspect of aspects) {
      const a = join(dossier, `${aspect}.ref.txt`);
      const b = join(dossier, `${aspect}.new.txt`);
      await writeFile(a, vues.ref[aspect]);
      await writeFile(b, vues.new[aspect]);
      const d = ecart(a, b);
      if (d) {
        await writeFile(join(dossier, `${aspect}.diff`), d);
        const lignes = d.split('\n').filter((l) => /^[+-](?![+-]{2})/.test(l)).length;
        rapports.push(`${aspect}@${largeur} : ${lignes} lignes`);
      }
    }
  }
  if (rapports.length) pagesEnEcart++;
  console.log(`${rapports.length ? 'ECART' : 'ok   '} ${chemin}${rapports.length ? '  ' + rapports.join(', ') : ''}`);
}

await navigateur.close();
console.log(`\n${liste.length - pagesEnEcart}/${liste.length} pages identiques, détails dans ${SORTIE}/`);
process.exit(pagesEnEcart ? 1 : 0);
