import { expect, test } from '@playwright/test';
import { accepterInvitation, seConnecter, statut, MEMBRE_1 } from './outils';

test.describe.configure({ mode: 'serial' });

const suffixe = Date.now().toString(36);
const structure = `Régie ${suffixe}`;
const regisseur = `regie-${suffixe}@exemple.com`;
const comptable = `compta-${suffixe}@exemple.com`;
const PDF = Buffer.from('%PDF-1.7\n% document fictif\n');

test('dossier, deux personnes invitées, échange de documents dans les deux sens, suppression', async ({ browser }, info) => {
  test.skip(info.project.name !== 'bureau');
  const me = await (await browser.newContext()).newPage();
  await seConnecter(me, MEMBRE_1);

  // L'équipe crée le dossier de la structure et y invite deux personnes.
  await me.goto('/espace/equipe/prestataires/');
  await me.getByLabel('Nom de la structure').fill(structure);
  await me.getByLabel('Prestation').fill('Son et lumière');
  await me.getByRole('button', { name: 'Créer le dossier' }).click();
  await expect(me.getByRole('heading', { level: 1, name: structure })).toBeVisible();
  const dossier = me.url();
  for (const email of [regisseur, comptable]) {
    await me.locator('#inv-email').fill(email);
    await me.getByRole('button', { name: 'Envoyer l’invitation' }).click();
    await expect(statut(me)).toContainText('Invitation envoyée');
    // Le message était déjà là après la première : c'est l'adresse dans les
    // invitations en attente qui dit que la redirection est arrivée.
    await expect(me.locator('#acces').getByText(email)).toBeVisible();
  }

  // L'équipe met un contrat à disposition.
  const vers = me.locator('section').filter({ has: me.getByRole('heading', { name: 'Mis à sa disposition' }) });
  await vers.getByLabel('Type de document').selectOption({ label: 'Contrat ou bon de commande' });
  await vers.locator('input[type=file]').setInputFiles({ name: 'contrat.pdf', mimeType: 'application/pdf', buffer: PDF });
  await vers.getByRole('button', { name: 'Déposer' }).click();
  await expect(vers.getByRole('link', { name: 'contrat.pdf' })).toBeVisible();

  // Le régisseur arrive dans le dossier, voit le contrat et dépose un devis.
  const re = await (await browser.newContext()).newPage();
  await accepterInvitation(re, regisseur);
  await expect(re).toHaveURL(/\/espace\/prestataire\//);
  await expect(re.getByRole('heading', { level: 1, name: structure })).toBeVisible();
  await expect(re.getByRole('link', { name: 'contrat.pdf' })).toBeVisible();
  await expect(re.locator('.esp-nav').getByRole('link', { name: 'Calendrier' })).toHaveCount(0);
  const transmettre = re.locator('#transmettre');
  await transmettre.getByLabel('Type de document').selectOption({ label: 'Devis' });
  await transmettre.locator('input[type=file]').setInputFiles({ name: 'devis.pdf', mimeType: 'application/pdf', buffer: PDF });
  await transmettre.getByRole('button', { name: 'Déposer' }).click();
  await expect(transmettre.getByRole('link', { name: 'devis.pdf' })).toBeVisible();

  // Rien des speakers ni de l'équipe ne lui est ouvert.
  for (const chemin of ['/espace/equipe/', '/espace/equipe/prestataires/', '/espace/calendrier/', '/espace/speaker/']) {
    const r = await re.goto(chemin);
    expect(r?.status(), chemin).toBe(404);
  }

  // Sa collègue voit le même dossier, devis compris.
  const co = await (await browser.newContext()).newPage();
  await accepterInvitation(co, comptable);
  await expect(co.getByRole('link', { name: 'devis.pdf' })).toBeVisible();
  await expect(co.getByRole('link', { name: 'contrat.pdf' })).toBeVisible();

  // L'équipe retrouve le devis dans le dossier, puis le supprime.
  await me.goto(dossier);
  await expect(me.getByRole('link', { name: 'devis.pdf' })).toBeVisible();
  const suppression = me.locator('section').filter({ has: me.getByRole('heading', { name: 'Supprimer ce prestataire' }) });
  await suppression.getByLabel(/Je confirme/).check();
  await suppression.getByRole('button', { name: 'Supprimer le prestataire' }).click();
  await expect(me).toHaveURL(/\/espace\/equipe\/prestataires\/\?ok=/);
  await expect(me.getByRole('link', { name: structure })).toHaveCount(0);
  await me.goto('/espace/equipe/archive/');
  await expect(me.getByRole('cell', { name: structure }).first()).toBeVisible();
});
