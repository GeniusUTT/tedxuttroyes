/* Rendu de controle : compose des pages entieres avec les composants du
   paquet et les ecrit en HTML statique, pour comparer a l'oeil avec les
   pages du site. Sert uniquement a la verification, n'est jamais publie.

   Usage : node demo.mjs   puis   python -m http.server 8010 */

import { build } from "esbuild";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, "demo", ".build");

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

await build({
  entryPoints: [join(here, "demo", "pages.tsx")],
  outfile: join(outDir, "pages.mjs"),
  bundle: true,
  format: "esm",
  platform: "node",
  jsx: "automatic",
  external: ["react", "react-dom"],
  logLevel: "warning"
});

const { renderToStaticMarkup } = await import("react-dom/server");
const { PAGES } = await import(pathToFileURL(join(outDir, "pages.mjs")).href);

const shellHtml = (title, body) => `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · controle design system</title>
<link rel="stylesheet" href="../dist/styles.css">
</head>
<body>
${body}
</body>
</html>
`;

const index = [];
for (const page of PAGES) {
  const html = renderToStaticMarkup(page.element);
  await writeFile(join(here, "demo", `${page.slug}.html`), shellHtml(page.title, html), "utf8");
  index.push(`<li><a href="./${page.slug}.html">${page.title}</a></li>`);
  console.log(`[demo] ${page.slug}.html`);
}

await writeFile(
  join(here, "demo", "index.html"),
  shellHtml(
    "Pages de controle",
    `<main id="contenu"><div class="sec"><div class="inner"><p class="cote">Controle</p><div class="sec-body"><h1 class="page-title">Rendu de controle</h1><ul class="footer-list">${index.join(
      ""
    )}</ul></div></div></div></main>`
  ),
  "utf8"
);
console.log(`[demo] ${PAGES.length} pages ecrites dans demo/`);
