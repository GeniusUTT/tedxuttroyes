import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { expect, type Page } from '@playwright/test';
import { codeAuPas, pasCourant } from '../../lib/totp';

const FICHIER = '.e2e-courriels.jsonl';

export const DISTANT = !!process.env.E2E_URL;
export const DOMAINE = process.env.E2E_DOMAINE ?? 'utt.fr';
export const ADMIN_1 = process.env.E2E_ADMIN_1 ?? 'admin-un@utt.fr';
export const ADMIN_2 = process.env.E2E_ADMIN_2 ?? 'admin-deux@utt.fr';

type Courriel = { a: string; sujet: string; texte: string; le: number };

// Sur un déploiement, les e-mails ne partent pas : le serveur les écrit dans
// ses journaux, que l'on relit par le CLI Vercel.
function courrielsDistants(): Courriel[] {
  const r = spawnSync('npx', ['--yes', 'vercel@63.1.2', 'logs', '--deployment', process.env.E2E_URL!, '--json', '--since', '30m', '--limit', '500', '--scope', 'ted-x-uttroyes', '--query', '"courriel non envoyé"'], { encoding: 'utf8', shell: true, maxBuffer: 20 * 1024 * 1024 });
  const sortie: Courriel[] = [];
  for (const ligne of (r.stdout ?? '').split('\n')) {
    try {
      const j = JSON.parse(ligne);
      const m = String(j.message ?? '').match(/\[courriel non envoyé\] à (\S+) : ([^\n]*)\n([\s\S]*)/);
      if (m) sortie.push({ a: m[1]!, sujet: m[2]!, texte: m[3]!, le: Number(j.timestamp ?? 0) });
    } catch {
      continue;
    }
  }
  return sortie.sort((x, y) => x.le - y.le);
}

async function courriels(): Promise<{ a: string; sujet: string; texte: string }[]> {
  if (DISTANT) return courrielsDistants();
  try {
    return (await readFile(FICHIER, 'utf8')).trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  } catch {
    return [];
  }
}

export async function attendreCourriel(a: string, motif: RegExp, apres = 0) {
  for (let i = 0; i < (DISTANT ? 25 : 50); i++) {
    const m = (await courriels()).filter((c) => c.a === a && motif.test(c.sujet));
    if (m.length > apres) return m.at(-1)!;
    await new Promise((r) => setTimeout(r, DISTANT ? 4000 : 200));
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

// Premier passage d'un admin : lit la clé affichée, calcule le code. Les
// clés sont gardées dans un fichier : chaque fichier de test a son module.
const FICHIER_SECRETS = '.e2e-secrets.json';
const secrets = {
  lire(): Record<string, string> { try { return JSON.parse(readFileSync(FICHIER_SECRETS, 'utf8')); } catch { return {}; } },
  get(k: string) { return this.lire()[k]; },
  has(k: string) { return k in this.lire(); },
  set(k: string, v: string) { writeFileSync(FICHIER_SECRETS, JSON.stringify({ ...this.lire(), [k]: v })); },
};

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
