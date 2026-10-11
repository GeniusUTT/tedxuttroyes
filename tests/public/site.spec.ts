import { expect, test, type Page } from '@playwright/test';

// Non-régression du site public, en bureau et en mobile, sur un déploiement
// réel : les pages se chargent sans erreur, la ligne se construit, le voile
// du 31 octobre tient, l'interlude se déroule, la mesure d'audience part du
// domaine, aucun cookie n'est déposé.

const PAGES = [
  '/', '/a-propos/', '/devenir-speaker/', '/editions/', '/editions/edition-2016/', '/faq/', '/hall-of-fame/',
  '/mentions-legales/', '/partenaires/', '/programme/', '/speakers/', '/speakers/2019/alexandre-dana/', '/tedx-utt-10e/',
];
const LICENCE = 'Cet événement TEDx indépendant est organisé sous licence de TED.';
const SUR_VERCEL = () => !/localhost/.test(test.info().project.use.baseURL ?? '');

async function surveiller(page: Page) {
  const erreurs: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') erreurs.push(m.text()); });
  page.on('pageerror', (e) => erreurs.push(e.message));
  page.on('response', (r) => {
    const u = new URL(r.url());
    const memeOrigine = u.origin === new URL(page.url() || r.url()).origin;
    if (memeOrigine && r.status() >= 400 && !(u.pathname.startsWith('/_vercel/') && !SUR_VERCEL())) erreurs.push(`${r.status()} ${u.pathname}`);
  });
  return erreurs;
}

for (const chemin of PAGES) {
  test(`${chemin} se charge sans erreur`, async ({ page }) => {
    const erreurs = await surveiller(page);
    const r = await page.goto(chemin, { waitUntil: 'load' });
    expect(r?.status()).toBe(200);
    await expect(page.locator('footer')).toContainText(LICENCE);
    await expect(page.locator('footer')).toContainText('Site public sans cookie');
    await page.waitForTimeout(800);
    expect(erreurs, erreurs.join('\n')).toEqual([]);
  });
}

test('la ligne se construit sur l’accueil', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  await page.evaluate(() => sessionStorage.setItem('tedx-ouverture', '1'));
  await page.reload({ waitUntil: 'load' });
  await expect.poll(async () => page.locator('svg path').count(), { timeout: 10_000 }).toBeGreaterThan(0);
  const longueur = await page.evaluate(() => Math.max(...[...document.querySelectorAll('svg path')].map((p) => (p as SVGPathElement).getTotalLength())));
  expect(longueur).toBeGreaterThan(1000);
});

test('la ligne se construit sur une page intérieure en mobile', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'en bureau, les pages intérieures ont la dorsale statique en CSS');
  await page.goto('/faq/', { waitUntil: 'load' });
  await expect.poll(async () => page.locator('main svg path').count(), { timeout: 10_000 }).toBeGreaterThan(0);
});

test('le voile du 31 octobre tient : date et thème masqués', async ({ page }) => {
  test.skip(Date.now() >= Date.parse('2026-10-31T17:00:00Z'), 'après le dévoilement');
  await page.goto('/', { waitUntil: 'load' });
  const texte = await page.locator('body').innerText();
  expect(texte).not.toContain('18 mars 2027');
  expect(texte).not.toContain('Franchir ou s');
  expect(await page.locator('.msk').count()).toBeGreaterThan(0);
});

test('la page cachée reste en noindex et hors du plan du site', async ({ page, request }) => {
  await page.goto('/tedx-utt-10e/');
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex, nofollow');
  expect(await page.locator('meta[property^="og:"]').count()).toBe(0);
  const plan = await (await request.get('/sitemap.xml')).text();
  expect(plan).not.toContain('tedx-utt-10e');
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).not.toContain('tedx-utt-10e');
});

test('la vidéo de l’interlude accepte les requêtes partielles', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  const statuts = await page.evaluate(async () => {
    const r = await Promise.all(['/assets/video/logo-10e-texte-scrub-576.mp4', '/assets/video/logo-10e-texte-scrub-384.mp4']
      .map((u) => fetch(u, { headers: { Range: 'bytes=1000-1999' } }).then(async (x) => [x.status, (await x.arrayBuffer()).byteLength])));
    return r;
  });
  expect(statuts).toEqual([[206, 1000], [206, 1000]]);
});

test('la mesure d’audience part du domaine', async ({ page }) => {
  test.skip(!SUR_VERCEL(), 'le script n’existe que sur Vercel');
  const [r] = await Promise.all([
    page.waitForResponse((x) => x.url().includes('/_vercel/insights/script.js')),
    page.goto('/', { waitUntil: 'load' }),
  ]);
  expect(r.status()).toBe(200);
  expect(new URL(r.url()).origin).toBe(new URL(page.url()).origin);
});

test('aucun cookie n’est déposé par le site public', async ({ page, context }) => {
  for (const chemin of ['/', '/faq/', '/speakers/']) await page.goto(chemin, { waitUntil: 'load' });
  const cookies = (await context.cookies()).filter((c) => c.name !== '_vercel_jwt' && !c.name.startsWith('_vercel'));
  expect(cookies).toEqual([]);
});

test('une adresse inconnue reçoit la 404 du site', async ({ page }) => {
  const r = await page.goto('/nexiste-pas/');
  expect(r?.status()).toBe(404);
  await expect(page).toHaveTitle(/Page introuvable/);
});

test('une ancienne adresse redirige vers la bonne page', async ({ page }) => {
  await page.goto('/editions/edition-2016.html');
  expect(new URL(page.url()).pathname).toBe('/editions/edition-2016/');
  await page.goto('/speakers/2019/speaker-2019.html');
  expect(new URL(page.url()).pathname).toBe('/editions/edition-2019/');
});
