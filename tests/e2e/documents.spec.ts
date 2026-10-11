import { expect, test } from '@playwright/test';
import { accepterInvitation, inviter, seConnecter, statut, MEMBRE_2 } from './outils';

test.describe.configure({ mode: 'serial' });

const suffixe = Date.now().toString(36);
const speaker = `orateur-${suffixe}@exemple.com`;
const nom = `Orateur ${suffixe}`;
const PDF = Buffer.from('%PDF-1.7\n% slides fictives\n');
const MODELE = Buffer.from(`%PDF-1.7\n% Speaker Release, modèle ${suffixe}\n`);
const SIGNEE = Buffer.from(`%PDF-1.7\n% Speaker Release, modèle ${suffixe}\n% signée\n`);

test('modèle, Release signée, slides, retours, intrus, suppression', async ({ browser }, info) => {
  test.skip(info.project.name !== 'bureau');
  const me = await (await browser.newContext()).newPage();
  await seConnecter(me, MEMBRE_2);

  // L'équipe met le modèle vierge en ligne, pour tous les speakers.
  await me.goto('/espace/equipe/');
  const modeles = me.locator('section').filter({ has: me.getByRole('heading', { name: 'Les modèles à signer' }) });
  const carteRelease = modeles.locator('.carte').filter({ hasText: 'Speaker Release (modèle à signer)' });
  if (await carteRelease.locator('input[type=file]').count()) {
    await carteRelease.locator('input[type=file]').setInputFiles({ name: 'speaker-release.pdf', mimeType: 'application/pdf', buffer: MODELE });
    await carteRelease.getByRole('button', { name: 'Déposer le modèle' }).click();
  } else {
    await carteRelease.getByText('Déposer une nouvelle version').click();
    await carteRelease.locator('input[type=file]').setInputFiles({ name: 'speaker-release.pdf', mimeType: 'application/pdf', buffer: MODELE });
    await carteRelease.getByRole('button', { name: 'Déposer la nouvelle version' }).click();
  }
  await expect(carteRelease.getByText('Document déposé.')).toBeVisible();
  await inviter(me, { email: speaker, nom, role: 'speaker' });

  // Le speaker arrive, voit ce qu'il doit fournir, télécharge le modèle.
  const sp = await (await browser.newContext()).newPage();
  await accepterInvitation(sp, speaker);
  await expect(sp).toHaveURL(/\/espace\/speaker\//);
  await expect(sp.getByRole('heading', { name: /pièces? à nous transmettre/ })).toBeVisible();
  const signer = sp.locator('#signer');
  const release = signer.locator('.carte--signer').filter({ hasText: 'Speaker Release signée' }).first();
  const [telechargement] = await Promise.all([sp.waitForEvent('download'), release.getByRole('link', { name: 'Télécharger le modèle' }).click()]);
  expect(telechargement.suggestedFilename()).toBe('speaker-release.pdf');

  // Renvoyé tel quel, sans signature : refusé.
  await release.locator('input[type=file]').setInputFiles({ name: 'speaker-release.pdf', mimeType: 'application/pdf', buffer: MODELE });
  await release.getByRole('button', { name: 'Déposer la version signée' }).click();
  await expect(release.locator('p.esp-message[role=alert]')).toContainText('modèle vierge');
  // Signé : accepté.
  await release.locator('input[type=file]').setInputFiles({ name: 'release-signee.pdf', mimeType: 'application/pdf', buffer: SIGNEE });
  await release.getByRole('button', { name: 'Déposer la version signée' }).click();
  await expect(signer.getByRole('link', { name: 'release-signee.pdf' })).toBeVisible();

  // Les slides, avec l'attestation des droits.
  const slides = sp.getByRole('region', { name: 'Slides' });
  await slides.locator('input[type=file]').setInputFiles({ name: 'mes-slides.pdf', mimeType: 'application/pdf', buffer: PDF });
  await slides.getByRole('button', { name: 'Déposer' }).click();
  expect(await slides.getByLabel(/J’atteste/).evaluate((c: HTMLInputElement) => c.validity.valueMissing)).toBe(true);
  await expect(slides.getByRole('link', { name: 'mes-slides.pdf' })).toHaveCount(0);
  await slides.getByLabel(/J’atteste/).check();
  await slides.getByRole('button', { name: 'Déposer' }).click();
  await expect(slides.getByRole('link', { name: 'mes-slides.pdf' })).toBeVisible();
  await expect(slides.getByText('droits attestés')).toBeVisible();

  // L'équipe ouvre le dossier, télécharge, répond.
  await me.goto('/espace/equipe/');
  await me.getByRole('link', { name: nom }).click();
  await expect(me).toHaveURL(/\/espace\/equipe\/speakers\/[^/]+\/$/);
  const dossier = new URL(me.url()).pathname;
  const [dl] = await Promise.all([me.waitForEvent('download'), me.getByRole('link', { name: 'mes-slides.pdf' }).click()]);
  expect(dl.suggestedFilename()).toBe('mes-slides.pdf');
  const lien = await me.getByRole('link', { name: 'mes-slides.pdf' }).getAttribute('href');
  await me.locator('.carte').filter({ hasText: 'mes-slides.pdf' }).getByRole('link', { name: 'Retours et historique' }).click();
  await me.getByLabel('Votre retour').fill('Slide 4 : la source de la photo ?');
  await me.getByRole('button', { name: 'Publier le retour' }).click();
  await expect(me.getByText('Slide 4 : la source de la photo ?')).toBeVisible();
  await expect(me).toHaveURL(/\/espace\/documents\/[^/]+\//);
  const pageDoc = new URL(me.url()).pathname;
  await sp.goto(pageDoc);
  await expect(sp.getByText('Slide 4 : la source de la photo ?')).toBeVisible();

  // Un autre speaker qui devine les adresses n'obtient rien.
  const intrus = `intrus-${suffixe}@exemple.com`;
  await inviter(me, { email: intrus, nom: 'Intrus Fictif', role: 'speaker' });
  const pi = await (await browser.newContext()).newPage();
  await accepterInvitation(pi, intrus);
  expect((await pi.request.get(lien!, { maxRedirects: 0 })).status()).toBe(404);
  expect((await pi.goto(pageDoc))?.status()).toBe(404);
  await expect(pi.getByRole('heading', { name: 'Page introuvable' })).toBeVisible();
  expect((await pi.goto(dossier))?.status()).toBe(404);
  await pi.goto('/espace/speaker/');
  await expect(pi.getByText('mes-slides.pdf')).toHaveCount(0);
  expect((await (await browser.newContext()).request.get(lien!, { maxRedirects: 0 })).status()).toBe(404);

  // Après la soirée : le lien de la vidéo arrive dans le dossier du speaker.
  await me.goto(dossier);
  await me.getByLabel('Lien YouTube (https)').fill('https://www.youtube.com/watch?v=fictif');
  await me.getByRole('button', { name: 'Enregistrer le lien' }).click();
  await expect(statut(me)).toContainText('Lien de la vidéo enregistré');
  await sp.goto('/espace/speaker/');
  await expect(sp.getByRole('link', { name: 'Voir mon talk sur YouTube' })).toHaveAttribute('href', 'https://www.youtube.com/watch?v=fictif');

  // L'équipe supprime le speaker : il disparaît de la liste, sa session tombe,
  // la Release signée reste dans l'archive.
  await me.goto(dossier);
  await me.getByLabel(/Je confirme la suppression/).check();
  await me.getByRole('button', { name: 'Supprimer le speaker' }).click();
  await expect(me).toHaveURL(/\/espace\/equipe\/\?ok=/);
  await expect(me.getByRole('link', { name: nom })).toHaveCount(0);
  await sp.goto('/espace/speaker/');
  await expect(sp).toHaveURL(/\/espace\/connexion\//);
  await me.goto('/espace/equipe/archive/');
  await expect(me.getByRole('row').filter({ hasText: 'release-signee.pdf' })).toBeVisible();
});
