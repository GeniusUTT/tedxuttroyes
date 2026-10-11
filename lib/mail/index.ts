import { appendFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import nodemailer, { type Transporter } from 'nodemailer';

// Un seul point d'envoi. Seule la production envoie de vrais e-mails : en
// prévisualisation et en local, le message est écrit dans le journal du
// serveur et dans un fichier, où les tests vont chercher le code.

export type Courriel = { a: string; sujet: string; texte: string; html: string };

export const FICHIER_COURRIELS = process.env.ESPACE_FICHIER_COURRIELS ?? join(tmpdir(), 'tedx-espace-courriels.jsonl');

function envoiReel(): boolean {
  return process.env.VERCEL_ENV === 'production' || process.env.ESPACE_FORCER_SMTP === 'oui';
}

let transport: Transporter | undefined;

function smtp(): Transporter {
  const port = Number(process.env.SMTP_PORT ?? 587);
  transport ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  return transport;
}

export async function envoyer(c: Courriel): Promise<void> {
  if (!envoiReel()) {
    console.info(`[courriel non envoyé] à ${c.a} : ${c.sujet}\n${c.texte}`);
    const ligne = JSON.stringify({ le: new Date().toISOString(), a: c.a, sujet: c.sujet, texte: c.texte });
    await appendFile(FICHIER_COURRIELS, ligne + '\n').catch(() => {});
    return;
  }
  await smtp().sendMail({
    from: process.env.MAIL_FROM ?? 'TEDxUTTroyes <noreply@tedxuttroyes.fr>',
    replyTo: process.env.MAIL_REPLY_TO ?? 'geniusutt@utt.fr',
    to: c.a,
    subject: c.sujet,
    text: c.texte,
    html: c.html,
  });
}
