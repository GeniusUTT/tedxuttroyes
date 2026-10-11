'use client';

import { useEffect } from 'react';

// Les scripts du site (dévoilement, header, ligne, carte) modifient la page :
// ils réécrivent les textes masqués, ajoutent le tracé de la ligne, déplacent
// le contenu dans le wrapper du défilement virtuel. React, lui, hydrate la
// page en supposant qu'elle est encore telle que le serveur l'a envoyée : si
// un script passait avant lui, il verrait l'écart et referait la page,
// effaçant tout ce que les scripts y ont posé.
//
// D'où ce chargeur : il n'injecte les scripts qu'une fois l'hydratation
// faite (un effet ne s'exécute qu'après), dans l'ordre donné et l'un après
// l'autre (async = false). Les pages n'ont aucun composant client dans leur
// contenu, React n'y retouchera donc plus jamais : les scripts ont la page
// pour eux seuls, comme avant.

export function ScriptsDuSite({ sources }: { sources: readonly string[] }) {
  useEffect(() => {
    for (const src of sources) {
      // En développement, React joue chaque effet deux fois.
      if (document.querySelector(`script[src="${src}"]`)) continue;
      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      document.body.appendChild(script);
    }
  }, [sources]);
  return null;
}
