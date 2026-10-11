import { expect, test } from '@playwright/test';
import { accepterInvitation, inviter, secondFacteur, seConnecter, ADMIN_1, ADMIN_2, DOMAINE } from './outils';

test.describe.configure({ mode: 'serial' });

const suffixe = Date.now().toString(36);
const speaker = `orateur-${suffixe}@exemple.com`;
const membre = `logistique-${suffixe}@${DOMAINE}`;
const PDF = Buffer.from('%PDF-1.7\n% slides fictives\n');

test('un speaker dépose ses slides avec attestation ; l’équipe les télécharge', async ({ browser }, info) => {
  test.skip(info.project.name !== 'bureau');
  const ad = await (await browser.newContext()).newPage();
  await seConnecter(ad, ADMIN_2);
  await secondFacteur(ad, ADMIN_2);
  await inviter(ad, { email: speaker, nom: 'Orateur Fictif', role: 'speaker' });
  await inviter(ad, { email: membre, nom: 'Logisticien Fictif', role: 'membre', poles: ['Logistique'] });

  const sp = await (await browser.newContext()).newPage();
  await accepterInvitation(sp, speaker);
  await expect(sp).toHaveURL(/\/espace\/speaker\//);
  const slides = sp.getByRole('region', { name: 'Slides' });
  await slides.locator('input[type=file]').setInputFiles({ name: 'mes-slides.pdf', mimeType: 'application/pdf', buffer: PDF });
  await slides.getByRole('button', { name: 'Déposer' }).click();
  // Sans la case cochée, le navigateur bloque l'envoi : rien n'est déposé.
  expect(await slides.getByLabel(/J’atteste/).evaluate((c: HTMLInputElement) => c.validity.valueMissing)).toBe(true);
  await expect(slides.getByRole('link', { name: 'mes-slides.pdf' })).toHaveCount(0);
  await slides.getByLabel(/J’atteste/).check();
  await slides.getByRole('button', { name: 'Déposer' }).click();
  await expect(slides.getByRole('link', { name: 'mes-slides.pdf' })).toBeVisible();
  await expect(slides.getByText('droits attestés')).toBeVisible();

  const me = await (await browser.newContext()).newPage();
  await accepterInvitation(me, membre);
  await me.getByRole('link', { name: 'Orateur Fictif' }).click();
  const [telechargement] = await Promise.all([me.waitForEvent('download'), me.getByRole('link', { name: 'mes-slides.pdf' }).click()]);
  expect(telechargement.suggestedFilename()).toBe('mes-slides.pdf');
  const lien = await me.getByRole('link', { name: 'mes-slides.pdf' }).getAttribute('href');

  // Un retour de l'équipe, lu par le speaker.
  await me.getByRole('link', { name: 'Retours et historique' }).first().click();
  await me.getByLabel('Votre retour').fill('Slide 4 : la source de la photo ?');
  await me.getByRole('button', { name: 'Publier le retour' }).click();
  await expect(me.getByText('Slide 4 : la source de la photo ?')).toBeVisible();
  await sp.goto('/espace/speaker/');
  await sp.getByRole('region', { name: 'Slides' }).getByRole('link', { name: 'Retours et historique' }).click();
  await expect(sp.getByText('Slide 4 : la source de la photo ?')).toBeVisible();

  // Le lien de téléchargement n'ouvre rien sans session.
  const anonyme = await (await browser.newContext()).request.get(lien!, { maxRedirects: 0 });
  expect(anonyme.status()).toBe(404);
});
