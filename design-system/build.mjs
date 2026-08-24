/* Build du paquet design system TEDxUTTroyes.
   Trois etapes, aucune transformation de style :
     1. le logo du site est fige en data URI (header et footer doivent
        rendre sans dependre d'un chemin absolu du site) ;
     2. les composants sont bundles en ESM, React reste externe ;
     3. la feuille unique du site est copiee telle quelle, seuls les
        chemins de polices sont reecrits, et les woff2 suivent.
   La feuille du site reste la seule source de verite visuelle : ce
   script ne minifie pas, ne prefixe pas, ne purge pas. */

import { build } from "esbuild";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  cp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile
} from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(here, "..");
const dist = join(here, "dist");

const log = (step, detail) => console.log(`[ds] ${step}${detail ? " : " + detail : ""}`);

/* ------------------------------------------------------------------
   ASSUMPTION : la feuille du site vit dans assets/css et s'appelle
   main*.css. Le glob couvre la regle de cache-busting du projet
   (main.css renomme en main-v2.css apres une mise en ligne) : on prend
   toujours la plus recente.
   ------------------------------------------------------------------ */
async function findSiteStylesheet() {
  const cssDir = join(siteRoot, "assets", "css");
  const entries = (await readdir(cssDir)).filter(
    (name) => name.startsWith("main") && name.endsWith(".css")
  );
  if (entries.length === 0) {
    throw new Error(`Aucune feuille main*.css trouvee dans ${cssDir}`);
  }
  const dated = await Promise.all(
    entries.map(async (name) => {
      const full = join(cssDir, name);
      return { full, name, mtime: (await stat(full)).mtimeMs };
    })
  );
  dated.sort((a, b) => b.mtime - a.mtime);
  return dated[0];
}

/* Le logo est le seul visuel dont les composants ne peuvent pas se
   passer : il est present dans le header et dans le footer de chaque
   page. Il part donc dans le bundle, en data URI. Tous les autres
   visuels sont des props (src), fournis par la page. */
async function generateAssets() {
  const logoPath = join(siteRoot, "assets", "img", "logo-white.png");
  const logo = await readFile(logoPath);
  const body = `/* Genere par build.mjs : ne pas editer a la main. */

/** Le logo TEDxUTTroyes (assets/img/logo-white.png), fige en data URI
 *  pour que le header et le footer rendent hors du site. */
export const LOGO_TEDXUTTROYES = "data:image/png;base64,${logo.toString("base64")}";

/** Dimensions natives du fichier logo. */
export const LOGO_WIDTH = 500;
export const LOGO_HEIGHT = 105;
`;
  await writeFile(join(here, "src", "assets.generated.ts"), body, "utf8");
  log("logo embarque", `${(logo.length / 1024).toFixed(1)} ko`);
}

async function bundle() {
  const result = await build({
    entryPoints: [join(here, "src", "index.ts")],
    outfile: join(dist, "index.js"),
    bundle: true,
    format: "esm",
    platform: "browser",
    target: ["es2020"],
    jsx: "automatic",
    external: ["react", "react-dom", "react/jsx-runtime"],
    sourcemap: false,
    minify: false,
    metafile: true,
    legalComments: "none"
  });
  const out = result.metafile.outputs[Object.keys(result.metafile.outputs)[0]];
  log("bundle", `${(out.bytes / 1024).toFixed(1)} ko`);
}

async function types() {
  /* On appelle l'entree Node de tsc plutot que le binaire npx : sous
     Windows, spawn d'un .cmd sans shell echoue (EINVAL). */
  const tsc = join(here, "node_modules", "typescript", "bin", "tsc");
  await execFileAsync(process.execPath, [tsc, "-p", "tsconfig.json"], { cwd: here });
  log("types", "dist/index.d.ts");
}

async function styles() {
  const sheet = await findSiteStylesheet();
  const css = await readFile(sheet.full, "utf8");
  /* Seule reecriture autorisee : la feuille vit desormais a cote du
     dossier fonts/ au lieu d'un cran au-dessus. */
  const rewritten = css.replaceAll('url("../fonts/', 'url("./fonts/');
  const moved = (css.match(/url\("\.\.\/fonts\//g) || []).length;

  /* Seul ajout a la feuille, et il ne fait que repeter ce qu'elle pose
     deja : main.css porte le fond noir et l'encre sur `body`. Les
     cartes d'apercu de Claude Design posent `body{background:#fff}` en
     style inline, apres la feuille, ce qui suffit a battre un selecteur
     d'element ; sur une DA entierement sombre, tous les textes
     deviendraient illisibles. `html body` est un cran plus specifique et
     remet le canevas dans sa couleur partout ou la feuille est chargee.
     Aucune autre regle du site n'est touchee. */
  const canevas = `

/* ==========================================================================
   Ajout du paquet design system (absent de main.css).
   Rappel du canevas, assez specifique pour survivre a un reset inline de
   body pose apres la feuille (cartes d'apercu). Meme valeurs que le site.
   ========================================================================== */
html body {
  background-color: var(--noir);
  color: var(--encre);
}
`;
  await writeFile(join(dist, "styles.css"), rewritten + canevas, "utf8");
  log("feuille", `${sheet.name} (${(css.length / 1024).toFixed(0)} ko, ${moved} chemins de police reecrits)`);

  const fontsSrc = join(siteRoot, "assets", "fonts");
  const fontsDist = join(dist, "fonts");
  await mkdir(fontsDist, { recursive: true });
  const fonts = (await readdir(fontsSrc)).filter((f) => f.endsWith(".woff2"));
  for (const font of fonts) {
    await cp(join(fontsSrc, font), join(fontsDist, font));
  }
  log("polices", `${fonts.length} fichiers woff2`);

  return { stylesheet: sheet.name, fonts: fonts.length };
}

async function main() {
  await rm(dist, { recursive: true, force: true });
  await mkdir(dist, { recursive: true });
  await generateAssets();
  await bundle();
  await types();
  const meta = await styles();
  await writeFile(
    join(here, ".ds-build-meta.json"),
    JSON.stringify({ builtAt: new Date().toISOString(), ...meta }, null, 2),
    "utf8"
  );
  log("termine", "dist/");
}

main().catch((error) => {
  console.error("[ds] echec du build");
  console.error(error);
  process.exit(1);
});
