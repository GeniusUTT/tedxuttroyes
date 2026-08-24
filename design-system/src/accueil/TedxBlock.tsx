import { LOGO_HEIGHT, LOGO_TEDXUTTROYES, LOGO_WIDTH } from "../assets.generated";
import { Icon } from "../base/Icon";
import { TEDX_PROGRAMME_URL, TEXTE_TEDX } from "../types";
import { VisuallyHidden } from "../base/VisuallyHidden";

export interface TedxBlockProps {
  /** L'annotation de marge. */
  cote?: string;
  /** Le titre du bloc. */
  title?: string;
  /** L'ancre de la section. */
  id?: string;
}

/**
 * Le bloc de conformite TEDx : le texte officiel « Qu'est-ce que
 * TEDx ? » et le lien vers ted.com/tedx. Sa presence sur la page
 * d'accueil est exigee par la licence. Le texte ne se reecrit pas et le
 * lien ne se retire pas.
 */
export function TedxBlock({
  cote = "Le programme TEDx",
  title = "Qu'est-ce que TEDx ?",
  id = "tedx"
}: TedxBlockProps) {
  return (
    <section className="mom mom--tedx" id={id}>
      <div className="mwrap">
        <p className="cote">{cote}</p>
        <div className="colL">
          <h2 className="h-md">{title}</h2>
          <p className="lead">{TEXTE_TEDX}</p>
          <div className="actions more-row">
            <a
              className="btn btn--ghost"
              href={TEDX_PROGRAMME_URL}
              target="_blank"
              rel="noopener"
            >
              Le programme TEDx : ted.com/tedx
              <VisuallyHidden> (nouvelle fenêtre)</VisuallyHidden>
              <Icon name="external" />
            </a>
          </div>
        </div>
        <figure
          className="tedx-logo"
          data-line="avoid"
          data-line-side="right"
          data-line-exit="tight"
          data-line-margin="28"
          data-line-margin-m="14"
        >
          <img
            src={LOGO_TEDXUTTROYES}
            alt="TEDxUTTroyes"
            width={LOGO_WIDTH}
            height={LOGO_HEIGHT}
            loading="lazy"
          />
        </figure>
      </div>
    </section>
  );
}
