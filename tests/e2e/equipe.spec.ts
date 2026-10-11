import { expect, test } from '@playwright/test';
import { seConnecter, MEMBRE_1, MEMBRE_2 } from './outils';

test('un membre consulte le calendrier, l’édition, le journal et l’archive', async ({ page }, info) => {
  test.skip(info.project.name !== 'bureau');
  await seConnecter(page, MEMBRE_2);
  await page.goto('/espace/calendrier/');
  await expect(page.getByRole('heading', { level: 1, name: 'Calendrier' })).toBeVisible();
  await expect(page.getByText('La soirée TEDxUTTroyes')).toBeVisible();
  await expect(page.locator('.cal-aujourdhui')).toHaveCount(1);
  await page.goto('/espace/equipe/edition/');
  await expect(page.getByRole('heading', { level: 1, name: 'Édition' })).toBeVisible();
  await expect(page.getByLabel('Lien de l’album (https)')).toBeVisible();
  await page.goto('/espace/equipe/journal/');
  await expect(page.getByRole('cell', { name: 'connexion' }).first()).toBeVisible();
  await page.goto('/espace/equipe/archive/');
  await expect(page.getByRole('heading', { level: 1, name: 'Archive' })).toBeVisible();
});

test('l’album photo de l’édition s’enregistre en https seulement', async ({ page }, info) => {
  test.skip(info.project.name !== 'bureau');
  await seConnecter(page, MEMBRE_2);
  await page.goto('/espace/equipe/edition/');
  await page.getByLabel('Lien de l’album (https)').fill('https://photos.exemple.com/tedxuttroyes-2027');
  await page.getByRole('button', { name: 'Enregistrer le lien' }).click();
  await expect(page.locator('p.esp-message[role=status]')).toContainText('album photo');
  await expect(page.getByLabel('Lien de l’album (https)')).toHaveValue('https://photos.exemple.com/tedxuttroyes-2027');
});

test('la tâche quotidienne est introuvable sans le secret', async ({ request }) => {
  const r = await request.get('/espace/api/taches/quotidiennes/');
  expect(r.status()).toBe(404);
  const r2 = await request.get('/espace/api/taches/quotidiennes/', { headers: { Authorization: 'Bearer faux' } });
  expect(r2.status()).toBe(404);
});

test('l’export de mes données est un JSON en pièce jointe', async ({ page }, info) => {
  test.skip(info.project.name !== 'bureau');
  await seConnecter(page, MEMBRE_1);
  const r = await page.request.get('/espace/api/export/');
  expect(r.status()).toBe(200);
  expect(r.headers()['content-disposition']).toMatch(/attachment/);
  const d = await r.json();
  expect(d.compte.email).toBe(MEMBRE_1);
});
