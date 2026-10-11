import { readFile } from 'node:fs/promises';
import { expect, type Page } from '@playwright/test';
import { codeAuPas, pasCourant } from '../../lib/totp';

const FICHIER = '.e2e-courriels.jsonl';

async function courriels(): Promise<{ a: string; sujet: string; texte: string }[]> {
  try {
    return (await readFile(FICHIER, 'utf8')).trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  } catch {
    return [];
  }
}

export async function attendreCourriel(a: string, motif: RegExp, apres = 0) {
  for (let i = 0; i < 50; i++) {
    const m = (await courriels()).filter((c) => c.a === a && motif.test(c.sujet));
    if (m.length > apres) return m.at(-1)!;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`pas de courriel ${motif} pour ${a}`);
}

export async function nombreCourriels(a: string) {
  return (await courriels()).filter((c) => c.a === a).length;
}

export async function seConnecter(page: Page, email: string) {
  const avant = (await courriels()).filter((c) => c.a === email && /code/.test(c.sujet)).length;
  await page.goto('/espace/connexion/');
  await page.getByLabel('Adresse e-mail').fill(email);
  await page.getByRole('button', { name: 'Recevoir un code' }).click();
  await expect(page).toHaveURL(/\/espace\/connexion\/code\//);
  const c = await attendreCourriel(email, /code/, avant);
  const code = c.texte.match(/\n(\d{6})\n/)![1]!;
  await page.getByLabel('Code reçu par e-mail').fill(code);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).not.toHaveURL(/connexion/);
}

// Premier passage d'un admin : lit la clé affichée, calcule le code.
const secrets = new Map<string, string>();

export async function secondFacteur(page: Page, email: string) {
  await page.goto('/espace/admin/');
  if (!/verification/.test(page.url())) return;
  const manuel = page.locator('code.secret');
  if (await manuel.count()) {
    await page.getByText('Saisie manuelle de la clé').click();
    secrets.set(email, (await manuel.textContent())!.trim());
  }
  const secret = secrets.get(email)!;
  // Attendre un pas neuf : un code déjà servi est refusé.
  const pas = pasCourant() + (secrets.has(`${email}:dernier`) ? 1 : 0);
  if (pas > pasCourant()) await page.waitForTimeout(30_000 - (Date.now() % 30_000) + 200);
  await page.getByLabel('Code à six chiffres').fill(codeAuPas(secret, pasCourant()));
  secrets.set(`${email}:dernier`, '1');
  await page.getByRole('button', { name: 'Valider' }).click();
  await expect(page).toHaveURL(/\/espace\/admin\/$/);
}

export async function inviter(page: Page, o: { email: string; nom: string; role: 'speaker' | 'membre' | 'admin'; poles?: string[]; derogation?: boolean }) {
  await page.goto('/espace/admin/');
  await page.locator('#email').fill(o.email);
  await page.locator('#nom').fill(o.nom);
  await page.locator('#role').selectOption(o.role);
  for (const p of o.poles ?? []) await page.getByLabel(p, { exact: true }).first().check();
  if (o.derogation) await page.getByLabel(/Dérogation/).check();
  await page.getByRole('button', { name: 'Envoyer l’invitation' }).click();
}

export async function accepterInvitation(page: Page, email: string) {
  const c = await attendreCourriel(email, /Invitation/);
  const lien = c.texte.match(/(\/espace\/invitation\/[^\s]+\/)/)![1]!;
  await page.goto(lien);
  await page.getByRole('button', { name: 'Accepter l’invitation' }).click();
  await expect(page).toHaveURL(/\/espace\/connexion\/code\//);
  const code = (await attendreCourriel(email, /code/)).texte.match(/\n(\d{6})\n/)![1]!;
  await page.getByLabel('Code reçu par e-mail').fill(code);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).not.toHaveURL(/connexion/);
  return lien;
}
