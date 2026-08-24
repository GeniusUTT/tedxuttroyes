export interface TalkFrameProps {
  /** L'identifiant de la video YouTube (la partie apres v=). */
  videoId: string;
  /** Le titre du lecteur, lu par les technologies d'assistance. */
  title: string;
}

/**
 * Le lecteur video d'un talk d'archive. Toujours en mode de
 * confidentialite renforcee (youtube-nocookie) et charge en differe :
 * tant que la video n'est pas lue, aucun cookie n'est depose.
 */
export function TalkFrame({ videoId, title }: TalkFrameProps) {
  return (
    <div className="talk-frame">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
