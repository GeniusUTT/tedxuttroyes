// Gabarits des e-mails : texte court, en français, le code bien visible et
// la mention de licence en pied. Aucun nom de speaker dans un objet de
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

export function courrielCode(code: string, lien: string) {
  const texte = [
    "Votre code de connexion à l'espace TEDxUTTroyes :",
    '',
    code,
    '',
    'Il est valable 10 minutes. Vous pouvez aussi ouvrir ce lien puis cliquer sur « Se connecter » :',
    lien,
    '',
    "Si vous n'avez rien demandé, ignorez ce message : personne ne peut se connecter sans ce code.",
    '',
    LICENCE,
  ].join('\n');
  const html = enveloppe(`<p style="margin:0 0 16px;color:#edeae4;">Votre code de connexion à l'espace TEDxUTTroyes :</p>
<p style="margin:0 0 16px;font-family:'Courier New',monospace;font-size:34px;letter-spacing:8px;color:#edeae4;font-weight:bold;">${echapper(code)}</p>
<p style="margin:0 0 16px;">Il est valable 10 minutes. Vous pouvez aussi <a href="${echapper(lien)}" style="color:#ff2e4d;">ouvrir ce lien</a> puis cliquer sur « Se connecter ».</p>
<p style="margin:0;font-size:13px;color:#7e7a73;">Si vous n'avez rien demandé, ignorez ce message : personne ne peut se connecter sans ce code.</p>`);
  return { sujet: `Votre code de connexion : ${code}`, texte, html };
}

const LIBELLES_ROLE = { speaker: 'speaker', membre: "membre de l'équipe", admin: 'admin' } as const;

export function courrielInvitation(lien: string, role: keyof typeof LIBELLES_ROLE, annee: number) {
  const r = LIBELLES_ROLE[role];
  const texte = [
    'Bonjour,',
    '',
    `Vous êtes invité à rejoindre l'espace TEDxUTTroyes ${annee} en tant que ${r}. C'est là que l'équipe et les speakers échangent leurs documents.`,
    '',
    "Pour accepter l'invitation, ouvrez ce lien (valable 7 jours, une seule fois) :",
    lien,
    '',
    'Aucun mot de passe : à chaque connexion, un code vous sera envoyé à cette adresse.',
    '',
    LICENCE,
  ].join('\n');
  const html = enveloppe(`<p style="margin:0 0 16px;color:#edeae4;">Bonjour,</p>
<p style="margin:0 0 16px;">Vous êtes invité à rejoindre l'espace TEDxUTTroyes ${annee} en tant que ${echapper(r)}. C'est là que l'équipe et les speakers échangent leurs documents.</p>
<p style="margin:0 0 24px;"><a href="${echapper(lien)}" style="display:inline-block;background:#eb0028;color:#ffffff;text-decoration:none;padding:12px 20px;font-weight:bold;">Accepter l'invitation</a></p>
<p style="margin:0;font-size:13px;color:#7e7a73;">Le lien est valable 7 jours et ne sert qu'une fois. Aucun mot de passe : à chaque connexion, un code vous sera envoyé à cette adresse.</p>`);
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
