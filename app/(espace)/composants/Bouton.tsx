'use client';

import { useFormStatus } from 'react-dom';
import type { ReactNode } from 'react';

// Bouton d'envoi qui se désactive pendant que l'action serveur tourne.
export function Bouton({ children, variante, petit }: { children: ReactNode; variante?: 'sobre' | 'danger'; petit?: boolean }) {
  const { pending } = useFormStatus();
  const cls = ['btn', variante ? `btn--${variante}` : '', petit ? 'btn--petit' : ''].filter(Boolean).join(' ');
  return <button className={cls} type="submit" disabled={pending}>{pending ? 'Un instant…' : children}</button>;
}
