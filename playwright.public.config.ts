import { defineConfig, devices } from '@playwright/test';

// Non-régression du site public. Vise un déploiement (E2E_URL) ou, à défaut,
// un serveur local. Prévisualisation protégée : VERCEL_AUTOMATION_BYPASS_SECRET
// (en-tête de contournement) ou VERCEL_JWT (cookie d'un lien de partage).

const entetes: Record<string, string> = {};
if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
  entetes['x-vercel-protection-bypass'] = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  entetes['x-vercel-set-bypass-cookie'] = 'true';
} else if (process.env.VERCEL_JWT) {
  entetes.cookie = `_vercel_jwt=${process.env.VERCEL_JWT}`;
}

export default defineConfig({
  testDir: 'tests/public',
  timeout: 60_000,
  workers: 4,
  use: { baseURL: process.env.E2E_URL ?? 'http://localhost:3300', extraHTTPHeaders: entetes, locale: 'fr-FR', trace: 'retain-on-failure' },
  projects: [
    { name: 'bureau', use: { ...devices['Desktop Chrome'], viewport: { width: 1600, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: process.env.E2E_URL ? undefined : { command: 'npx next start -p 3300', url: 'http://localhost:3300/', timeout: 120_000 },
});
