// Repart d'un état neuf avant chaque série de parcours : base, courriels,
// secrets TOTP et fichiers déposés des essais précédents.
import { rmSync } from 'node:fs';

for (const f of ['.e2e-base', '.e2e-courriels.jsonl', '.e2e-secrets.json', '.e2e-stockage']) rmSync(f, { recursive: true, force: true });
