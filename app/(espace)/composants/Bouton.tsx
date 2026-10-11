'use client';

import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';

// Bouton d'envoi qui se désactive pendant que l'action serveur tourne. Les
// classes sont celles du site public : plein rouge par défaut, filet pour
// « sobre », filet et texte rouge pour « danger ».
export function Bouton({ children, variante, petit }: { children: ReactNode; variante?: 'sobre' | 'danger'; petit?: boolean }) {
  const { pending } = useFormStatus();
  const cls = ['btn', variante === 'sobre' ? 'btn--ghost' : variante === 'danger' ? 'btn--ghost btn--danger' : 'btn--primary', petit ? 'btn--sm' : '']
    .filter(Boolean).join(' ');
  return <button className={cls} type="submit" disabled={pending}>{pending ? 'Un instant…' : children}</button>;
}
