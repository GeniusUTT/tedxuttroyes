import { expect, test } from '@playwright/test';

// L'espace vu de l'extérieur, sans compte : jamais indexé, jamais en cache,
// muet sur l'existence des comptes, fermé sans session. N'écrit rien
// d'autre qu'un compteur de débit et une ligne de journal.

test('la page de connexion est en noindex et hors cache', async ({ page }) => {
  const r = await page.goto('/espace/connexion/');
  expect(r?.status()).toBe(200);
  expect(r?.headers()['x-robots-tag']).toContain('noindex');
  expect(r?.headers()['cache-control']).toContain('no-store');
  await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('footer')).toContainText('Cet événement TEDx indépendant est organisé sous licence de TED.');
});

test('une adresse inconnue reçoit la réponse neutre', async ({ page }, info) => {
  test.skip(info.project.name !== 'bureau');
  await page.goto('/espace/connexion/oubli/');
  await page.getByLabel('Adresse e-mail').fill('adresse-inconnue-verification@geniusutt.fr');
  await page.getByRole('button', { name: 'Recevoir le lien' }).click();
  await expect(page.locator('p.esp-message[role=status]')).toContainText('Si cette adresse a un compte');
});

test('l’en-tête du site mène à l’espace, plus à « Postuler »', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.site-header a[href="/espace/"]')).toHaveText('Espace');
  await expect(page.locator('.site-header').getByText('Postuler', { exact: true })).toHaveCount(0);
  await expect(page.locator('.mobile-menu-foot a[href="/espace/"]')).toHaveCount(1);
});

test('sans session, l’espace est fermé', async ({ page, request }) => {
  await page.goto('/espace/equipe/');
  expect(new URL(page.url()).pathname).toBe('/espace/connexion/');
  expect((await request.get('/espace/api/fichiers/00000000-0000-0000-0000-000000000000/', { maxRedirects: 0 })).status()).toBe(404);
  expect((await request.get('/espace/api/export/')).status()).toBe(404);
  expect((await request.get('/espace/api/taches/quotidiennes/')).status()).toBe(404);
});

// Pas de Disallow : un robot bloqué ne voit jamais le noindex, et Google
// indexait /espace/ sans contenu (« indexée malgré le blocage », 2026-10-15).
test('l’espace est ouvert aux robots, qui y lisent le noindex, et absent du plan du site', async ({ request }) => {
  expect(await (await request.get('/robots.txt')).text()).not.toContain('/espace/');
  expect(await (await request.get('/sitemap.xml')).text()).not.toContain('/espace');
});
