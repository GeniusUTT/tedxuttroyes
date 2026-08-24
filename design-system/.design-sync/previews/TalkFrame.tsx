import { Heading, Lead, TalkFrame } from "@tedxuttroyes/design-system";

/**
 * Le lecteur d'un talk d'archive. Toujours en confidentialite renforcee
 * (youtube-nocookie) et charge en differe : tant que la video n'est pas
 * lue, aucun cookie n'est depose.
 */
export function Lecteur() {
  return (
    <TalkFrame videoId="zP3BkpaMpaU" title="Vidéo : Alexandre au TEDxUTTroyes 2019" />
  );
}

/** En situation : le talk sous son titre, comme sur une fiche d'archive. */
export function EnSituation() {
  return (
    <div>
      <Heading>Alexandre au TEDxUTTroyes 2019</Heading>
      <Lead>« Apprendre à entreprendre : quelle drôle d'idée »</Lead>
      <TalkFrame videoId="zP3BkpaMpaU" title="Vidéo : Alexandre au TEDxUTTroyes 2019" />
    </div>
  );
}
