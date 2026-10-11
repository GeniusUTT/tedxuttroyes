import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { expect, type Page } from '@playwright/test';

const FICHIER = '.e2e-courriels.jsonl';

export const DISTANT = !!process.env.E2E_URL;
export const DOMAINE = process.env.E2E_DOMAINE ?? 'utt.fr';
export const MEMBRE_1 = process.env.E2E_MEMBRE_1 ?? 'membre-un@utt.fr';
export const MEMBRE_2 = process.env.E2E_MEMBRE_2 ?? 'membre-deux@utt.fr';
// Le mot de passe des membres d'essai (posé par scripts/secours.ts en
// local, par ESPACE_MDP_ESSAI sur une prévisualisation) et des comptes que
// les parcours créent.
export const MDP = process.env.E2E_MDP ?? 'phrase de passe des essais';

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

export async function seConnecter(page: Page, email: string, mdp = MDP) {
  await page.goto('/espace/connexion/');
  await page.getByLabel('Adresse e-mail').fill(email);
  await page.getByLabel('Mot de passe').fill(mdp);
  await page.getByRole('button', { name: 'Se connecter' }).click();
  await expect(page).not.toHaveURL(/connexion/);
}

export async function inviter(page: Page, o: { email: string; nom: string; role: 'speaker' | 'membre'; derogation?: boolean }) {
  await page.goto('/espace/equipe/comptes/');
  await page.locator('#inv-email').fill(o.email);
  await page.locator('#inv-nom').fill(o.nom);
  await page.locator('#inv-role').selectOption(o.role);
  if (o.derogation) await page.getByLabel(/Dérogation/).check();
  await page.getByRole('button', { name: 'Envoyer l’invitation' }).click();
}

// Ouvre le lien de l'invitation, choisit le mot de passe : la personne
// arrive connectée dans l'espace.
export async function accepterInvitation(page: Page, email: string, mdp = MDP) {
  const c = await attendreCourriel(email, /Invitation/);
  const lien = c.texte.match(/(\/espace\/invitation\/[^\s]+\/)/)![1]!;
  await page.goto(lien);
  await page.getByLabel('Mot de passe', { exact: true }).fill(mdp);
  await page.getByLabel('Le même, une seconde fois').fill(mdp);
  await page.getByRole('button', { name: 'Créer mon compte' }).click();
  await expect(page).not.toHaveURL(/invitation/);
  return lien;
}

export const statut = (page: Page) => page.locator('p.esp-message[role=status]');
export const alerte = (page: Page) => page.locator('p.esp-message[role=alert]');
