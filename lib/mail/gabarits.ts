// Gabarits des e-mails : texte court, en français, un seul bouton et la
// mention de licence en pied. Aucun nom de speaker dans un objet de
// message : l'objet s'affiche dans les notifications d'un téléphone.

const LICENCE = 'Cet événement TEDx indépendant est organisé sous licence de TED.';

const ENTITES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function echapper(t: string): string {
  return t.replace(/[&<>"']/g, (c) => ENTITES[c] ?? c);
}

function enveloppe(corps: string): string {
  return `<!doctype html><html lang="fr"><body style="margin:0;padding:0;background:#080808;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#080808;"><tr><td style="padding:32px 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;color:#b7b2a9;font-size:15px;line-height:1.55;">
<tr><td style="padding-bottom:20px;border-bottom:1px solid #2a2724;font-weight:bold;font-size:18px;color:#edeae4;">TEDx<span style="color:#eb0028;">UTTroyes</span></td></tr>
<tr><td style="padding:24px 0;">${corps}</td></tr>
<tr><td style="padding-top:16px;border-top:1px solid #2a2724;font-size:12px;color:#7e7a73;">${LICENCE}</td></tr>
</table></td></tr></table></body></html>`;
}

export function courrielReinitialisation(lien: string) {
  const texte = [
    'Bonjour,',
    '',
    "Pour choisir le mot de passe de votre compte sur l'espace TEDxUTTroyes, ouvrez ce lien (valable une heure, une seule fois) :",
    lien,
    '',
    "Si vous n'avez rien demandé, ignorez ce message : votre mot de passe actuel reste valable.",
    '',
    LICENCE,
  ].join('\n');
  const html = enveloppe(`<p style="margin:0 0 16px;color:#edeae4;">Bonjour,</p>
<p style="margin:0 0 16px;">Pour choisir le mot de passe de votre compte sur l'espace TEDxUTTroyes, ouvrez ce lien.</p>
<p style="margin:0 0 24px;"><a href="${echapper(lien)}" style="display:inline-block;background:#eb0028;color:#ffffff;text-decoration:none;padding:12px 20px;font-weight:bold;">Choisir mon mot de passe</a></p>
<p style="margin:0;font-size:13px;color:#7e7a73;">Le lien est valable une heure et ne sert qu'une fois. Si vous n'avez rien demandé, ignorez ce message : votre mot de passe actuel reste valable.</p>`);
  return { sujet: 'Espace TEDxUTTroyes : votre mot de passe', texte, html };
}

const LIBELLES_ROLE = { speaker: 'speaker', membre: "membre de l'équipe" } as const;

export function courrielInvitation(lien: string, role: keyof typeof LIBELLES_ROLE, annee: number) {
  const r = LIBELLES_ROLE[role];
  const quoi = role === 'speaker'
    ? "C'est là que vous retrouverez le calendrier de l'événement, les documents à fournir et ceux que l'équipe met à votre disposition."
    : "C'est là que l'équipe suit les speakers : leurs dossiers, leurs documents, le calendrier.";
  const texte = [
    'Bonjour,',
    '',
    `Vous êtes invité à rejoindre l'espace TEDxUTTroyes ${annee} en tant que ${r}. ${quoi}`,
    '',
    "Pour accepter l'invitation et choisir votre mot de passe, ouvrez ce lien (valable 7 jours, une seule fois) :",
    lien,
    '',
    LICENCE,
  ].join('\n');
  const html = enveloppe(`<p style="margin:0 0 16px;color:#edeae4;">Bonjour,</p>
<p style="margin:0 0 16px;">Vous êtes invité à rejoindre l'espace TEDxUTTroyes ${annee} en tant que ${echapper(r)}. ${echapper(quoi)}</p>
<p style="margin:0 0 24px;"><a href="${echapper(lien)}" style="display:inline-block;background:#eb0028;color:#ffffff;text-decoration:none;padding:12px 20px;font-weight:bold;">Accepter l'invitation</a></p>
<p style="margin:0;font-size:13px;color:#7e7a73;">Le lien est valable 7 jours et ne sert qu'une fois. Vous y choisirez le mot de passe de votre compte.</p>`);
  return { sujet: `Invitation à l'espace TEDxUTTroyes ${annee}`, texte, html };
}

export function courrielNotification(titre: string, phrase: string, lien: string) {
  const texte = [
    phrase,
    '',
    lien,
    '',
    'Vous recevez ce message parce que les notifications sont activées sur votre compte. Elles se coupent depuis la page « Mon compte ».',
    '',
    LICENCE,
  ].join('\n');
  const html = enveloppe(`<p style="margin:0 0 16px;color:#edeae4;">${echapper(phrase)}</p>
<p style="margin:0 0 24px;"><a href="${echapper(lien)}" style="color:#ff2e4d;">Ouvrir dans l'espace</a></p>
<p style="margin:0;font-size:13px;color:#7e7a73;">Vous recevez ce message parce que les notifications sont activées sur votre compte. Elles se coupent depuis la page « Mon compte ».</p>`);
  return { sujet: titre, texte, html };
}
