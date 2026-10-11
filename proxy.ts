import { NextResponse, type NextRequest } from 'next/server';

// Simple aiguillage : un visiteur sans cookie de session est renvoyé vers la
// connexion. Aucun contrôle de droit ici, ils sont tous refaits côté serveur
// dans chaque page, action et route de l'espace.

const LIBRES = ['/espace/connexion', '/espace/invitation', '/espace/api/'];

export function proxy(req: NextRequest) {
  const chemin = req.nextUrl.pathname;
  if (LIBRES.some((p) => chemin.startsWith(p))) return NextResponse.next();
  if (!req.cookies.has('__Host-tedx-session')) {
    return NextResponse.redirect(new URL('/espace/connexion/', req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/espace', '/espace/:chemin*'] };
