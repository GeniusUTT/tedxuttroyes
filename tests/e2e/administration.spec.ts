import { expect, test } from '@playwright/test';
import { secondFacteur, seConnecter } from './outils';

test('l’admin consulte le journal, l’édition et l’archive', async ({ page }, info) => {
  test.skip(info.project.name !== 'bureau');
  await seConnecter(page, 'admin-deux@utt.fr');
  await secondFacteur(page, 'admin-deux@utt.fr');
  await page.goto('/espace/admin/journal/');
  await expect(page.getByRole('heading', { name: 'Journal' })).toBeVisible();
  await expect(page.getByRole('cell', { name: /second facteur/ }).first()).toBeVisible();
  await page.goto('/espace/admin/edition/');
  await expect(page.getByRole('heading', { name: /dixième édition/ })).toBeVisible();
  await expect(page.locator('input[name=libelle]').first()).toBeVisible();
  await page.goto('/espace/admin/archive/');
  await expect(page.getByRole('heading', { name: 'Speaker Releases archivées' })).toBeVisible();
});

test('la tâche quotidienne est introuvable sans le secret', async ({ request }) => {
  const r = await request.get('/espace/api/taches/quotidiennes/');
  expect(r.status()).toBe(404);
  const r2 = await request.get('/espace/api/taches/quotidiennes/', { headers: { Authorization: 'Bearer faux' } });
  expect(r2.status()).toBe(404);
});

test('l’export de mes données est un JSON en pièce jointe', async ({ page }, info) => {
  test.skip(info.project.name !== 'bureau');
  await seConnecter(page, 'admin-un@utt.fr');
  const r = await page.request.get('/espace/api/export/');
  expect(r.status()).toBe(200);
  expect(r.headers()['content-disposition']).toMatch(/attachment/);
  const d = await r.json();
  expect(d.compte.email).toBe('admin-un@utt.fr');
});
