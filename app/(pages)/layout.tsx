import type { Viewport } from 'next';
import type { ReactNode } from 'react';
import { Document } from '../_site/Document';
import { SCRIPTS } from '../_site/liens';

// Les pages intérieures du site public. Elles sont toutes précalculées au
// build : aucune ne dépend de la requête.
export const dynamic = 'force-static';

export const viewport: Viewport = { themeColor: '#080808' };

const scripts = [SCRIPTS.devoilement, SCRIPTS.principal, SCRIPTS.ligne];

export default function PagesInterieures({ children }: { children: ReactNode }) {
  return (
    <Document corps="parcours" scripts={scripts}>
      {children}
    </Document>
  );
}
