import { defineConfig, devices } from '@playwright/test';

// Parcours de l'espace, en local sur une base PGlite neuve : aucun e-mail ne
// part, les codes sont lus dans le fichier où le serveur les écrit. Deux
// admins fictifs sont créés par la procédure de secours avant le démarrage.

const PORT = 3200;
const ENV = {
  DATABASE_URL: 'pglite:.e2e-base',
  BETTER_AUTH_SECRET: 'secret-de-test-e2e-uniquement-0123456789abcdef',
  ESPACE_URL: `http://localhost:${PORT}`,
  ESPACE_DOMAINE_MEMBRES: 'utt.fr',
  ESPACE_FICHIER_COURRIELS: '.e2e-courriels.jsonl',
  STORAGE_DRIVER: 'local',
  STOCKAGE_LOCAL_DOSSIER: '.e2e-stockage',
};

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  use: { baseURL: process.env.E2E_URL ?? `http://localhost:${PORT}`, locale: 'fr-FR', trace: 'retain-on-failure' },
  projects: [
    { name: 'bureau', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.E2E_URL ? undefined : {
    command: [
      'node -e "require(\'fs\').rmSync(\'.e2e-base\',{recursive:true,force:true});require(\'fs\').rmSync(\'.e2e-courriels.jsonl\',{force:true})"',
      'npx tsx scripts/migrer.ts',
      'npx tsx scripts/admin-secours.ts admin-un@utt.fr "Admin Un"',
      'npx tsx scripts/admin-secours.ts admin-deux@utt.fr "Admin Deux"',
      `npx next start -p ${PORT}`,
    ].join(' && '),
    url: `http://localhost:${PORT}/espace/connexion/`,
    timeout: 180_000,
    reuseExistingServer: false,
    env: ENV,
  },
});
