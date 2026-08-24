/* Verification de fidelite : compare le vocabulaire de classes CSS
   produit par les composants du paquet avec celui des vraies pages du
   site. Le design system ne redefinit aucun style, il rejoue le markup
   du site : si une classe du site n'est produite par aucun composant,
   un morceau du site n'est pas couvert ; si une classe apparait cote
   paquet sans exister nulle part sur le site, c'est une invention.

   Le verdict porte sur l'union de toutes les pages (un composant peut
   etre couvert par une page de controle et pas une autre). Le detail
   par page est donne a titre indicatif.

   Usage : node demo.mjs puis node verify.mjs */

import { readFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const site = join(here, "..");

/* Chaque paire associe une page de controle a la page du site dont elle
   reprend le gabarit. La page « gabarits » n'a pas d'equivalent : elle
   rend les etats annonces, qui ne vivent qu'en commentaire sur le site. */
const PAIRES = [
  ["accueil", "index.html"],
  ["speakers", "speakers/index.html"],
  ["programme", "programme/index.html"],
  ["editions", "editions/index.html"],
  ["edition-2016", "editions/edition-2016/index.html"],
  ["speaker-archive", "speakers/2019/alexandre-dana/index.html"],
  ["hall-of-fame", "hall-of-fame/index.html"],
  ["partenaires", "partenaires/index.html"],
  ["a-propos", "a-propos/index.html"],
  ["faq", "faq/index.html"],
  ["devenir-speaker", "devenir-speaker/index.html"],
  ["mentions-legales", "mentions-legales/index.html"],
  ["404", "404.html"]
];

const HORS_PAIRE = ["gabarits"];

/* Classes posees par le JavaScript du site a l'execution : elles ne
   figurent dans aucun HTML source, ni dans le rendu des composants. */
const RUNTIME = new Set([
  "jscroll",
  "jline-fail",
  "jline-run",
  "is-on",
  "is-in",
  "is-open",
  "is-scrolled",
  "plug-on",
  "nav-open",
  "js"
]);

/* Exclusions assumees : ces classes appartiennent a des mecanismes que
   le paquet ne reprend pas volontairement (voir README). */
const EXCLUSIONS = new Map([
  ["probe", "sondes de mesure de line.js, sans rendu"],
  ["lieu-map", "point de montage de la carte Mapbox, exclue du paquet"]
]);

const classesDe = (html) => {
  const set = new Set();
  for (const m of html.matchAll(/class="([^"]+)"/g)) {
    for (const token of m[1].split(/\s+/)) {
      if (token && !RUNTIME.has(token)) {
        set.add(token);
      }
    }
  }
  return set;
};

const union = (sets) => {
  const out = new Set();
  for (const s of sets) {
    for (const v of s) {
      out.add(v);
    }
  }
  return out;
};

const renduDe = async (slug) =>
  classesDe(await readFile(join(here, "demo", `${slug}.html`), "utf8"));

const rendus = [];
const reelles = [];
const lignes = [];

for (const [slug, page] of PAIRES) {
  const rendu = await renduDe(slug);
  const reelle = classesDe(await readFile(join(site, page), "utf8"));
  rendus.push(rendu);
  reelles.push(reelle);

  const manquantes = [...reelle].filter((c) => !rendu.has(c)).sort();
  const inventees = [...rendu].filter((c) => !reelle.has(c)).sort();
  lignes.push(
    `  ${slug.padEnd(17)} ${String(reelle.size).padStart(3)} classes | ` +
      `absentes ici : ${manquantes.length || "0"}` +
      (inventees.length ? ` | en plus ici : ${inventees.length}` : "")
  );
}

for (const slug of HORS_PAIRE) {
  rendus.push(await renduDe(slug));
}

const toutSite = union(reelles);
const toutRendu = union(rendus);

const nonCouvertes = [...toutSite]
  .filter((c) => !toutRendu.has(c))
  .filter((c) => !EXCLUSIONS.has(c))
  .sort();
const exclues = [...toutSite].filter((c) => EXCLUSIONS.has(c)).sort();
const inventees = [...toutRendu].filter((c) => !toutSite.has(c)).sort();

console.log("Detail par page (indicatif) :");
console.log(lignes.join("\n"));
console.log(`\nVocabulaire du site : ${toutSite.size} classes.`);
console.log(`Vocabulaire du paquet : ${toutRendu.size} classes.`);

if (exclues.length) {
  console.log("\nExclusions assumees :");
  for (const c of exclues) {
    console.log(`  ${c} : ${EXCLUSIONS.get(c)}`);
  }
}

console.log(
  `\nClasses du site non couvertes : ${nonCouvertes.length ? nonCouvertes.join(", ") : "aucune"}`
);
console.log(`Classes inventees par le paquet : ${inventees.length ? inventees.join(", ") : "aucune"}`);

const echec = nonCouvertes.length > 0 || inventees.length > 0;
console.log(echec ? "\nVerification en echec." : "\nVerification passee : couverture complete du site.");
process.exit(echec ? 1 : 0);
