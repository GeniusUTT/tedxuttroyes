import { redirect } from 'next/navigation';
import { acteurCourant } from '@/lib/acces';

export default async function Accueil() {
  const a = await acteurCourant();
  if (!a) redirect('/espace/connexion/');
  redirect(a.role === 'speaker' ? '/espace/speaker/' : '/espace/equipe/');
}
