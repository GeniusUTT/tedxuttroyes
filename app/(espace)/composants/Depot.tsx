'use client';

import { useRouter } from 'next/navigation';
import { useId, useRef, useState } from 'react';
import type { Rattachement } from '@/lib/categories';
import { actionConfirmer, actionPreparer } from '../espace/documents/actions';

// Envoi direct du navigateur vers le stockage : le fichier ne passe jamais
// par une fonction. Trois temps : le serveur réserve la place et signe le
// formulaire, le navigateur envoie, le serveur vérifie et crée la version.

type Choix = { slug: string; libelle: string; formats: string[]; maxMo: number; attestation?: boolean; aide?: string };

export function Depot({ rattachement, speakerId, poleId, documentId, categories, titreLibre, libelleBouton }: {
  rattachement: Rattachement;
  speakerId?: string;
  poleId?: string;
  documentId?: string;
  categories: Choix[];
  titreLibre?: boolean;
  libelleBouton?: string;
}) {
  const id = useId();
  const router = useRouter();
  const fichier = useRef<HTMLInputElement>(null);
  const [cat, setCat] = useState(categories[0]!.slug);
  const [titre, setTitre] = useState('');
  const [atteste, setAtteste] = useState(false);
  const [progres, setProgres] = useState<number | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [fait, setFait] = useState<string | null>(null);
  const c = categories.find((x) => x.slug === cat)!;
  const accept = [...new Set(c.formats)].map((f) => `.${f}`).join(',');

  async function envoyer(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setFait(null);
    const f = fichier.current?.files?.[0];
    if (!f) return setErreur('Choisissez un fichier.');
    if (c.attestation && !atteste) return setErreur('Cochez l’attestation sur les droits.');
    if (f.size > c.maxMo * 1024 * 1024) return setErreur(`Fichier trop lourd : ${c.maxMo} Mo au plus.`);
    setProgres(0);
    const p = await actionPreparer({ rattachement, speakerId, poleId, documentId, categorie: cat, titre, nom: f.name, taille: f.size });
    if (!p.ok) {
      setProgres(null);
      return setErreur(p.erreur);
    }
    const corps = new FormData();
    for (const [k, v] of Object.entries(p.formulaire.champs)) corps.append(k, v);
    corps.append('file', f);
    const ok = await new Promise<boolean>((resoudre) => {
      const x = new XMLHttpRequest();
      x.open('POST', p.formulaire.url);
      x.upload.onprogress = (ev) => ev.lengthComputable && setProgres(Math.round((ev.loaded / ev.total) * 100));
      x.onload = () => resoudre(x.status >= 200 && x.status < 300);
      x.onerror = () => resoudre(false);
      x.send(corps);
    });
    if (!ok) {
      setProgres(null);
      return setErreur('L’envoi a échoué. Vérifiez votre connexion et réessayez.');
    }
    const r = await actionConfirmer(p.envoiId, atteste, window.location.pathname);
    setProgres(null);
    if (!r.ok) return setErreur(r.erreur);
    if (fichier.current) fichier.current.value = '';
    setAtteste(false);
    setTitre('');
    setFait('Document déposé.');
    router.refresh();
  }

  return (
    <form onSubmit={envoyer} className="depot">
      {categories.length > 1 && (
        <div className="champ">
          <label htmlFor={`${id}-cat`}>Type de document</label>
          <select id={`${id}-cat`} value={cat} onChange={(e) => setCat(e.target.value)}>
            {categories.map((x) => <option key={x.slug} value={x.slug}>{x.libelle}</option>)}
          </select>
        </div>
      )}
      {titreLibre && (
        <div className="champ">
          <label htmlFor={`${id}-titre`}>Titre</label>
          <input id={`${id}-titre`} type="text" value={titre} onChange={(e) => setTitre(e.target.value)} maxLength={200} placeholder={c.libelle} />
        </div>
      )}
      <div className="champ">
        <label htmlFor={`${id}-f`}>Fichier ({[...new Set(c.formats)].join(', ')} ; {c.maxMo} Mo au plus)</label>
        <input id={`${id}-f`} ref={fichier} type="file" accept={accept} required />
      </div>
      {c.aide && <p className="muet">{c.aide}</p>}
      {c.attestation && (
        <label className="case champ">
          <input type="checkbox" checked={atteste} onChange={(e) => setAtteste(e.target.checked)} required />
          J’atteste détenir les droits sur les images, musiques et vidéos utilisées dans ces slides (règles de copyright TEDx).
        </label>
      )}
      {erreur && <p className="message" role="alert">{erreur}</p>}
      {fait && <p className="message message--ok" role="status">{fait}</p>}
      {progres !== null && <progress max={100} value={progres} aria-label="Progression de l’envoi" />}
      <button className="btn btn--petit" type="submit" disabled={progres !== null}>{progres !== null ? `Envoi… ${progres} %` : libelleBouton ?? 'Déposer'}</button>
    </form>
  );
}
