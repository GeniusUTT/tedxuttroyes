import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './espace.css';

// Tout l'espace dépend de la session : rien n'y est précalculé.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { default: 'Espace TEDxUTTroyes', template: '%s | Espace TEDxUTTroyes' },
  robots: { index: false, follow: false, nocache: true },
  icons: { icon: '/assets/img/favicon-10e.svg' },
};

export const viewport: Viewport = { themeColor: '#080808', colorScheme: 'dark' };

export default function Racine({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
