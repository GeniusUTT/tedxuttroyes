// Vérifie les services réels, sans rien laisser derrière : POST présigné
// vers le seau (acceptation, refus de taille, refus de type), lecture par URL
// signée, liste, suppression ; puis envoi d'un e-mail par le SMTP.
//
//   npx tsx scripts/verifier-services.ts <seau> [adresse-pour-le-mail]

import { randomUUID } from 'node:crypto';
import { StockageS3 } from '../lib/storage/s3';

const ok = (m: string) => console.info(`OK  ${m}`);
const ko = (m: string) => { console.error(`ECHEC  ${m}`); process.exitCode = 1; };

async function envoyerFormulaire(url: string, champs: Record<string, string>, corps: Uint8Array, type: string) {
  const f = new FormData();
  for (const [k, v] of Object.entries(champs)) f.set(k, k === 'Content-Type' ? type : v);
  f.set('file', new Blob([new Uint8Array(corps)], { type }), 'essai.pdf');
  const r = await fetch(url, { method: 'POST', body: f });
  return { statut: r.status, texte: await r.text() };
}

async function stockageReel(seau: string) {
  const s = new StockageS3(seau);
  const cle = `verification/${randomUUID()}`;
  const pdf = new TextEncoder().encode('%PDF-1.7\n% fichier de verification\n');
  const form = await s.formulaireEnvoi(cle, 'application/pdf', 1024, 300);
  const bon = await envoyerFormulaire(form.url, form.champs, pdf, 'application/pdf');
  bon.statut === 204 ? ok(`envoi accepté (${bon.statut})`) : ko(`envoi refusé ${bon.statut} ${bon.texte.slice(0, 200)}`);
  const gros = await envoyerFormulaire(form.url, form.champs, new Uint8Array(2048).fill(65), 'application/pdf');
  gros.statut >= 400 && /EntityTooLarge|too large/i.test(gros.texte) ? ok(`fichier trop gros refusé (${gros.statut})`) : ko(`fichier trop gros non refusé ${gros.statut} ${gros.texte.slice(0, 200)}`);
  const autre = await (async () => {
    const f2 = await s.formulaireEnvoi(`${cle}-type`, 'application/pdf', 1024, 300);
    return envoyerFormulaire(f2.url, f2.champs, pdf, 'text/html');
  })();
  autre.statut === 403 ? ok(`type interdit refusé (${autre.statut})`) : ko(`type interdit non refusé ${autre.statut} ${autre.texte.slice(0, 200)}`);
  const infos = await s.infos(cle);
  infos?.taille === pdf.length ? ok(`objet présent, ${infos.taille} octets`) : ko('objet absent après envoi');
  (await s.infos(`${cle}-type`)) === null ? ok('aucun objet créé par l’envoi refusé') : ko('un envoi refusé a créé un objet');
  const debut = await s.debut(cle, 4);
  new TextDecoder().decode(debut) === '%PDF' ? ok('lecture des premiers octets') : ko('lecture des premiers octets');
  const url = await s.urlLecture(cle, 'Essai été.pdf', 'application/pdf', 60);
  const g = await fetch(url);
  g.status === 200 && /attachment/.test(g.headers.get('content-disposition') ?? '') ? ok(`téléchargement par URL signée (${g.status}, ${g.headers.get('content-disposition')})`) : ko(`téléchargement ${g.status}`);
  const anonyme = await fetch(url.split('?')[0]!);
  anonyme.status === 403 ? ok('sans signature : 403, aucune URL publique') : ko(`objet lisible sans signature (${anonyme.status})`);
  const liste = await s.lister('verification/');
  liste.some((o) => o.cle === cle) ? ok('liste') : ko('liste');
  await s.supprimer(cle);
  (await s.infos(cle)) === null ? ok('suppression') : ko('suppression');
}

async function smtpReel(a: string) {
  process.env.ESPACE_FORCER_SMTP = 'oui';
  const { envoyer } = await import('../lib/mail');
  const { courrielNotification } = await import('../lib/mail/gabarits');
  await envoyer({ a, ...courrielNotification('Espace TEDxUTTroyes : e-mail de vérification', 'Ceci est un e-mail de vérification de l’espace connecté. Il n’appelle aucune action.', 'https://tedxuttroyes.fr/espace/') });
  ok(`e-mail remis au serveur SMTP pour ${a}`);
}

async function principal() {
  const [seau, adresse] = process.argv.slice(2);
  if (!seau) throw new Error('Usage : verifier-services.ts <seau> [adresse]');
  await stockageReel(seau);
  if (adresse) await smtpReel(adresse);
}

principal().catch((e) => { ko(String(e?.message ?? e)); });
