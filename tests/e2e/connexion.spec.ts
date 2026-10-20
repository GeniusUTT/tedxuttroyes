import { expect, test } from '@playwright/test';
import { accepterInvitation, alerte, attendreCourriel, inviter, nombreCourriels, seConnecter, statut, DOMAINE, MDP, MEMBRE_1, MEMBRE_2 } from './outils';

// Un seul projet suffit pour ces parcours (ils créent des comptes) : le
// projet mobile rejoue seulement la connexion et l'affichage.
test.describe.configure({ mode: 'serial' });

const suffixe = Date.now().toString(36);
const membre = `membre-${suffixe}@${DOMAINE}`;
const speaker = `speaker-${suffixe}@exemple.com`;

test('un membre se connecte et invite', async ({ page }, info) => {
  test.skip(info.project.name !== 'bureau');
  await seConnecter(page, MEMBRE_1);
  await expect(page).toHaveURL(/\/espace\/equipe\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Speakers' })).toBeVisible();

  await inviter(page, { email: `externe-${suffixe}@exemple.com`, nom: 'Membre Hors Domaine', role: 'membre' });
  await expect(alerte(page)).toContainText('dérogation');

  await inviter(page, { email: membre, nom: 'Membre Fictif', role: 'membre' });
  await expect(statut(page)).toContainText('Invitation envoyée');
  await inviter(page, { email: speaker, nom: 'Speaker Fictif', role: 'speaker' });
  await expect(statut(page)).toContainText('Invitation envoyée');
});

test('les invités choisissent leur mot de passe ; un speaker n’entre pas chez l’équipe', async ({ browser }, info) => {
  test.skip(info.project.name !== 'bureau');
  for (const [email, accueil] of [[membre, /\/espace\/equipe\/$/], [speaker, /\/espace\/speaker\/$/]] as const) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    const lien = await accepterInvitation(page, email);
    await expect(page).toHaveURL(accueil);
    if (email === speaker) {
      expect((await page.goto('/espace/equipe/'))?.status()).toBe(404);
      expect((await page.goto('/espace/equipe/comptes/'))?.status()).toBe(404);
      await expect(page.getByRole('heading', { name: 'Page introuvable' })).toBeVisible();
    }
    // Le lien d'invitation ne sert qu'une fois.
    await page.goto(lien);
    await expect(page.getByRole('heading', { name: 'Lien plus valable' })).toBeVisible();
    await ctx.close();
  }
});

test('un mauvais mot de passe et une adresse inconnue reçoivent la même réponse', async ({ page }) => {
  for (const email of [MEMBRE_2, `personne-${suffixe}@${DOMAINE}`]) {
    await page.goto('/espace/connexion/');
    await page.getByLabel('Adresse e-mail').fill(email);
    await page.getByLabel('Mot de passe').fill('pas le bon mot de passe');
    await page.getByRole('button', { name: 'Se connecter' }).click();
    await expect(alerte(page)).toHaveText('Adresse ou mot de passe incorrect.');
  }
});

test('mot de passe oublié : réponse neutre, lien d’une heure, nouveau mot de passe', async ({ page }, info) => {
  test.skip(info.project.name !== 'bureau');
  const inconnue = `personne-${suffixe}@${DOMAINE}`;
  await page.goto('/espace/connexion/');
  await page.getByRole('link', { name: /Recevoir un lien/ }).click();
  await page.getByLabel('Adresse e-mail').fill(inconnue);
  await page.getByRole('button', { name: 'Recevoir le lien' }).click();
  await expect(statut(page)).toContainText('Si cette adresse a un compte');
  expect(await nombreCourriels(inconnue)).toBe(0);

  await page.getByLabel('Adresse e-mail').fill(speaker);
  await page.getByRole('button', { name: 'Recevoir le lien' }).click();
  await expect(statut(page)).toContainText('Si cette adresse a un compte');
  const c = await attendreCourriel(speaker, /mot de passe/);
  expect(c.texte).toContain('Cet événement TEDx indépendant est organisé sous licence de TED.');
  const lien = c.texte.match(/(\/espace\/mot-de-passe\/[^\s]+\/)/)![1]!;
  await page.goto(lien);
  const nouveau = `${MDP} renouvelée`;
  await page.getByLabel('Mot de passe', { exact: true }).fill(nouveau);
  await page.getByLabel('Le même, une seconde fois').fill(nouveau);
  await page.getByRole('button', { name: 'Enregistrer et se connecter' }).click();
  await expect(page).toHaveURL(/\/espace\/speaker\/$/);
  await page.goto(lien);
  await expect(page.getByRole('heading', { name: 'Lien expiré' })).toBeVisible();
});

test('sans session, l’espace renvoie vers la connexion', async ({ page }) => {
  await page.goto('/espace/equipe/');
  await expect(page).toHaveURL(/\/espace\/connexion\/$/);
});

test('le cookie de session est __Host-, HttpOnly, SameSite=Lax', async ({ page, context }, info) => {
  test.skip(info.project.name !== 'bureau');
  await seConnecter(page, MEMBRE_2);
  const c = (await context.cookies()).find((x) => x.name === '__Host-tedx-session');
  expect(c).toBeTruthy();
  expect(c!.httpOnly).toBe(true);
  expect(c!.secure).toBe(true);
  expect(c!.sameSite).toBe('Lax');
  expect(c!.path).toBe('/');
  expect(c!.domain).toBe(new URL(page.url()).hostname);
});

test('un membre désactive un autre membre : sa session tombe aussitôt', async ({ browser }, info) => {
  test.skip(info.project.name !== 'bureau');
  const ctxMembre = await browser.newContext();
  const pm = await ctxMembre.newPage();
  await seConnecter(pm, membre);
  await expect(pm).toHaveURL(/\/espace\/equipe\//);

  const ctxAutre = await browser.newContext();
  const pa = await ctxAutre.newPage();
  await seConnecter(pa, MEMBRE_1);
  await pa.goto('/espace/equipe/comptes/');
  const ligne = pa.getByRole('row').filter({ hasText: membre });
  await ligne.getByText('Gérer').click();
  await ligne.getByRole('button', { name: 'Désactiver' }).click();
  await expect(statut(pa)).toContainText('désactivé');

  await pm.goto('/espace/equipe/');
  await expect(pm).toHaveURL(/\/espace\/connexion\//);
  await pm.getByLabel('Adresse e-mail').fill(membre);
  await pm.getByLabel('Mot de passe').fill(MDP);
  await pm.getByRole('button', { name: 'Se connecter' }).click();
  await expect(alerte(pm)).toHaveText('Adresse ou mot de passe incorrect.');
  await ctxMembre.close();
  await ctxAutre.close();
});

test('l’espace est une rubrique du site : même en-tête, même pied, ni code ni script de la ligne', async ({ page }) => {
  await page.goto('/espace/connexion/');
  await expect(page.locator('header.site-header')).toBeVisible();
  await expect(page.locator('link[rel=stylesheet][href="/assets/css/main-v15.css"]')).toHaveCount(1);
  await expect(page.locator('script[src*="line-"]')).toHaveCount(0);
  await expect(page.locator('footer.site-footer')).toContainText('Cet événement TEDx indépendant est organisé sous licence de TED.');
  await expect(page.locator('body')).toHaveClass(/espace/);
  // Le bouton « Espace » de l'en-tête, marqué comme rubrique courante.
  const bouton = page.locator('.nav-desktop a[href="/espace/"], .mobile-menu-foot a[href="/espace/"]');
  await expect(bouton.first()).toHaveAttribute('aria-current', 'page');
  // La DA « le relevé » : aucun arrondi, aucune ombre, sur les champs et les boutons.
  for (const sel of ['input[type=email]', 'input[type=password]', 'button[type=submit]']) {
    const s = await page.locator(sel).first().evaluate((e) => { const c = getComputedStyle(e); return [c.borderRadius, c.boxShadow]; });
    expect(s).toEqual(['0px', 'none']);
  }
});
