import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./', import.meta.url)) } },
  test: {
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    environment: 'node',
    pool: 'forks',
    testTimeout: 30_000,
    env: {
      DATABASE_URL: 'pglite:memoire',
      BETTER_AUTH_SECRET: 'secret-de-test-uniquement-0123456789abcdef',
      ESPACE_URL: 'http://localhost:3000',
      ESPACE_DOMAINE_MEMBRES: 'utt.fr',
      ESPACE_FICHIER_COURRIELS: '.tests-courriels.jsonl',
    },
  },
});
