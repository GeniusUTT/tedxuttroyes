// Tire de sources/assets/ les fichiers servis dans public/assets/, sans leurs
// commentaires. Les visiteurs ne lisent plus la documentation du projet, qui
// reste entière dans les sources (demande de Baptiste le 2026-11-23).
//
//   node scripts/epurer-assets.mjs             écrit les fichiers servis
//   node scripts/epurer-assets.mjs --verifier  échoue si l'un d'eux n'est pas à jour
//
// Les noms servis ne sont écrits qu'à un endroit, app/_site/liens.ts (FEUILLE
// et SCRIPTS) : le script les y lit. Pour publier une retouche, passer au
// numéro suivant dans liens.ts puis relancer le script ; l'ancien fichier
// servi du même nom est retiré. reveal-v4.js n'est plus chargé par aucune page
// mais reste servi pour les pages encore en cache : son nom est figé.
//
// Rien n'est minifié : seuls les commentaires partent, le code garde sa mise
// en forme. Un commentaire qui tenait sur plusieurs lignes au milieu du code
// est remplacé par un saut de ligne, pour ne rien changer à l'insertion
// automatique des points-virgules.

import { existsSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');

// Mots après lesquels une barre oblique ouvre une expression régulière.
const MOTS_AVANT_REGEX = new Set([
  'return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'throw', 'case', 'do', 'else', 'yield', 'await',
]);

/** Repère les commentaires d'un source JavaScript ou CSS : liste de [début, fin[. */
export function reperer(source, langage) {
  const js = langage === 'js';
  const commentaires = [];
  let i = 0;
  let precedent = ''; // dernier caractère significatif hors commentaire (JS)
  let mot = ''; // dernier mot (JS)
  const n = source.length;
  while (i < n) {
    const c = source[i];
    const s = source[i + 1];
    if (c === '/' && s === '*') {
      const fin = source.indexOf('*/', i + 2);
      if (fin < 0) throw new Error(`commentaire non fermé à la position ${i}`);
      commentaires.push([i, fin + 2]);
      i = fin + 2;
      continue;
    }
    if (js && c === '/' && s === '/') {
      let fin = source.indexOf('\n', i);
      if (fin < 0) fin = n;
      commentaires.push([i, fin]);
      i = fin;
      continue;
    }
    if (c === '"' || c === "'" || (js && c === '`')) {
      i = finDeChaine(source, i, c);
      precedent = c;
      mot = '';
      continue;
    }
    if (js && c === '/') {
      const regex = precedent === '' || /[(,=:[!&|?{};+\-*%<>~^]/.test(precedent) || MOTS_AVANT_REGEX.has(mot);
      if (regex) {
        i = finDeRegex(source, i);
        precedent = '/';
        mot = '';
        continue;
      }
    }
    if (!/\s/.test(c)) {
      if (/[A-Za-z0-9_$]/.test(c)) {
        mot = /[A-Za-z0-9_$]/.test(precedent) ? mot + c : c;
      } else {
        mot = '';
      }
      precedent = c;
    }
    i++;
  }
  return commentaires;
}

function finDeChaine(source, debut, guillemet) {
  let i = debut + 1;
  while (i < source.length) {
    const c = source[i];
    if (c === '\\') {
      i += 2;
      continue;
    }
    if (guillemet === '`' && c === '$' && source[i + 1] === '{') {
      // Gabarit avec expression : on saute jusqu'à l'accolade fermante.
      let profondeur = 1;
      i += 2;
      while (i < source.length && profondeur > 0) {
        if (source[i] === '{') profondeur++;
        else if (source[i] === '}') profondeur--;
        else if (source[i] === '"' || source[i] === "'" || source[i] === '`') {
          i = finDeChaine(source, i, source[i]);
          continue;
        }
        i++;
      }
      continue;
    }
    if (c === guillemet) return i + 1;
    if (c === '\n' && guillemet !== '`') throw new Error(`chaîne non fermée à la position ${debut}`);
    i++;
  }
  throw new Error(`chaîne non fermée à la position ${debut}`);
}

function finDeRegex(source, debut) {
  let i = debut + 1;
  let classe = false;
  while (i < source.length) {
    const c = source[i];
    if (c === '\\') {
      i += 2;
      continue;
    }
    if (c === '\n') throw new Error(`expression régulière non fermée à la position ${debut}`);
    if (classe) {
      if (c === ']') classe = false;
    } else if (c === '[') {
      classe = true;
    } else if (c === '/') {
      i++;
      while (/[a-z]/.test(source[i] ?? '')) i++;
      return i;
    }
    i++;
  }
  throw new Error(`expression régulière non fermée à la position ${debut}`);
}

/** Le source sans ses commentaires, lignes vides en trop retirées. */
export function epurer(source, langage) {
  let sortie = '';
  let curseur = 0;
  for (const [debut, fin] of reperer(source, langage)) {
    sortie += source.slice(curseur, debut);
    const avant = sortie.slice(-1);
    const apres = source[fin] ?? '';
    const blancAutour = avant === '' || /\s/.test(avant) || /\s/.test(apres);
    if (source.slice(debut, fin).includes('\n') && !/\n\s*$/.test(sortie)) sortie += '\n';
    else if (!blancAutour) sortie += ' ';
    curseur = fin;
  }
  sortie += source.slice(curseur);
  return (
    sortie
      .split('\n')
      .map((ligne) => ligne.replace(/\s+$/, ''))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/^\n+/, '')
      .replace(/\n*$/, '\n')
  );
}

/** Les couples source et fichier servi, noms lus dans app/_site/liens.ts. */
export function fichiers() {
  const liens = readFileSync(join(RACINE, 'app/_site/liens.ts'), 'utf8');
  const nom = (motif) => {
    const trouve = liens.match(motif);
    if (!trouve) throw new Error(`nom introuvable dans liens.ts : ${motif}`);
    return trouve[1];
  };
  return [
    { source: 'sources/assets/css/main.css', servi: nom(/FEUILLE = '(\/assets\/css\/main-v\d+\.css)'/) },
    { source: 'sources/assets/js/main.js', servi: nom(/principal: '(\/assets\/js\/main-v\d+\.js)'/) },
    { source: 'sources/assets/js/line.js', servi: nom(/ligne: '(\/assets\/js\/line-v\d+\.js)'/) },
    { source: 'sources/assets/js/map.js', servi: nom(/carte: '(\/assets\/js\/map-v\d+\.js)'/) },
    { source: 'sources/assets/js/reveal.js', servi: '/assets/js/reveal-v4.js' },
  ].map(({ source, servi }) => ({
    source: join(RACINE, source),
    servi: join(RACINE, 'public', servi),
    langage: source.endsWith('.css') ? 'css' : 'js',
  }));
}

/** Les écarts entre les fichiers servis et leurs sources, vide si tout est à jour. */
export function ecarts() {
  const liste = [];
  for (const { source, servi, langage } of fichiers()) {
    const attendu = epurer(readFileSync(source, 'utf8'), langage);
    if (!existsSync(servi)) liste.push(`${servi} manque`);
    else if (readFileSync(servi, 'utf8') !== attendu) liste.push(`${servi} n'est pas à jour`);
    for (const autre of anciens(servi)) liste.push(`${autre} est une version périmée`);
  }
  return liste;
}

// Les autres numéros du même fichier dans public/ (main-v16.css quand on sert main-v17.css).
function anciens(servi) {
  if (basename(servi) === 'reveal-v4.js') return [];
  const [, base, ext] = basename(servi).match(/^(.*)-v\d+\.(css|js)$/);
  const dossier = dirname(servi);
  return readdirSync(dossier)
    .filter((f) => new RegExp(`^${base}-v\\d+\\.${ext}$`).test(f) && f !== basename(servi))
    .map((f) => join(dossier, f));
}

function ecrire() {
  for (const { source, servi, langage } of fichiers()) {
    writeFileSync(servi, epurer(readFileSync(source, 'utf8'), langage));
    for (const autre of anciens(servi)) unlinkSync(autre);
    console.log(`${servi.slice(RACINE.length + 1)} écrit`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--verifier')) {
    const liste = ecarts();
    if (liste.length) {
      console.error(liste.join('\n') + '\nLancer : node scripts/epurer-assets.mjs');
      process.exit(1);
    }
    console.log('fichiers servis à jour');
  } else {
    ecrire();
  }
}
