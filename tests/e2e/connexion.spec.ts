import { expect, test } from '@playwright/test';
import { accepterInvitation, attendreCourriel, inviter, nombreCourriels, secondFacteur, seConnecter } from './outils';

// Un seul projet suffit pour ces parcours (ils créent des comptes) : le
// projet mobile rejoue seulement la connexion et l'affichage.
test.describe.configure({ mode: 'serial' });

const suffixe = Date.now().toString(36);
const membre = `membre-${suffixe}@utt.fr`;
const speaker = `speaker-${suffixe}@exemple.com`;

test('un admin se connecte, valide son second facteur et invite', async ({ page }, info) => {
  test.skip(info.project.name !== 'bureau');
  await seConnecter(page, 'admin-un@utt.fr');
  await page.goto('/espace/admin/');
  await expect(page).toHaveURL(/\/espace\/admin\/verification\//);
  await secondFacteur(page, 'admin-un@utt.fr');
  await expect(page.getByRole('heading', { name: 'Comptes et invitations' })).toBeVisible();

  await inviter(page, { email: `externe-${suffixe}@exemple.com`, nom: 'Membre Hors Domaine', role: 'membre' });
  await expect(page.locator('p.message[role=alert]')).toContainText('dérogation');

  await inviter(page, { email: membre, nom: 'Membre Fictif', role: 'membre', poles: ['Logistique'] });
  await expect(page.locator('p.message[role=status]')).toContainText('Invitation envoyée');
  await inviter(page, { email: speaker, nom: 'Speaker Fictif', role: 'speaker' });
  await expect(page.locator('p.message[role=status]')).toContainText('Invitation envoyée');
});

test('les invités acceptent ; ni membre ni speaker n’entrent dans l’administration', async ({ browser }, info) => {
  test.skip(info.project.name !== 'bureau');
  for (const [email, accueil] of [[membre, /\/espace\/equipe\//], [speaker, /\/espace\/speaker\//]] as const) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const lien = await accepterInvitation(page, email);
    await expect(page).toHaveURL(accueil);
    const r = await page.goto('/espace/admin/');
    expect(r?.status()).toBe(404);
    await page.goto('/espace/admin/verification/');
    await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible();
    // Le lien d'invitation ne sert qu'une fois.
    await page.goto(lien);
    await expect(page.getByRole('heading', { name: 'Lien plus valable' })).toBeVisible();
    await ctx.close();
  }
});

test('une adresse inconnue reçoit la même réponse et aucun e-mail', async ({ page }) => {
  const inconnue = `personne-${suffixe}@utt.fr`;
  await page.goto('/espace/connexion/');
  await page.getByLabel('Adresse e-mail').fill(inconnue);
  await page.getByRole('button', { name: 'Recevoir un code' }).click();
  await expect(page.locator('p.message[role=status]')).toContainText('Si cette adresse a un compte');
  expect(await nombreCourriels(inconnue)).toBe(0);
});

test('un mauvais code est refusé, la page ne dit rien de plus', async ({ page }) => {
  await page.goto(`/espace/connexion/code/?email=${encodeURIComponent('admin-deux@utt.fr')}`);
  await page.getByLabel('Code reçu par e-mail').fill('000000');
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page.locator('p.message[role=alert]')).toContainText('Code incorrect ou expiré');
});

test('sans session, l’espace renvoie vers la connexion', async ({ page }) => {
  await page.goto('/espace/equipe/');
  await expect(page).toHaveURL(/\/espace\/connexion\/$/);
});

test('le cookie de session est __Host-, HttpOnly, SameSite=Lax', async ({ page, context }, info) => {
  test.skip(info.project.name !== 'bureau');
  await seConnecter(page, 'admin-deux@utt.fr');
  const c = (await context.cookies()).find((x) => x.name === '__Host-tedx-session');
  expect(c).toBeTruthy();
  expect(c!.httpOnly).toBe(true);
  expect(c!.secure).toBe(true);
  expect(c!.sameSite).toBe('Lax');
  expect(c!.path).toBe('/');
  expect(c!.domain).toBe('localhost');
});

test('un admin désactive un membre : sa session tombe aussitôt', async ({ browser }, info) => {
  test.skip(info.project.name !== 'bureau');
  const ctxMembre = await browser.newContext();
  const pm = await ctxMembre.newPage();
  await seConnecter(pm, membre);
  await expect(pm).toHaveURL(/\/espace\/equipe\//);

  const ctxAdmin = await browser.newContext();
  const pa = await ctxAdmin.newPage();
  await seConnecter(pa, 'admin-un@utt.fr');
  await secondFacteur(pa, 'admin-un@utt.fr');
  const ligne = pa.getByRole('row').filter({ hasText: membre });
  await ligne.getByText('Modifier').click();
  await ligne.getByRole('button', { name: 'Désactiver' }).click();
  await expect(pa.locator('p.message[role=status]')).toContainText('désactivé');

  await pm.goto('/espace/equipe/');
  await expect(pm).toHaveURL(/\/espace\/connexion\//);
  // Et plus aucun code ne lui est envoyé.
  const avant = await nombreCourriels(membre);
  await pm.getByLabel('Adresse e-mail').fill(membre);
  await pm.getByRole('button', { name: 'Recevoir un code' }).click();
  await expect(pm.locator('p.message[role=status]')).toContainText('Si cette adresse a un compte');
  expect(await nombreCourriels(membre)).toBe(avant);
  await ctxMembre.close();
  await ctxAdmin.close();
});

test('l’e-mail de code porte la mention de licence', async () => {
  const c = await attendreCourriel('admin-un@utt.fr', /code/);
  expect(c.texte).toContain('Cet événement TEDx indépendant est organisé sous licence de TED.');
  expect(c.sujet).toMatch(/^Votre code de connexion : \d{6}$/);
});
