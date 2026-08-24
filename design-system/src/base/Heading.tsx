import type { ReactNode } from "react";

export interface HeadingProps {
  /** Le titre. */
  children: ReactNode;
  /** Niveau du titre dans le document. Un seul h1 par page (PageHead). */
  level?: 2 | 3;
  /** Identifiant, quand une section est nommee par ce titre. */
  id?: string;
  /** Langue du titre, quand le theme est en anglais (« en »). */
  lang?: string;
}

/**
 * Le titre de section courant du site (classe h-md) : display, deux
 * crans sous le titre de page. Les h2 des blocs prose n'en ont pas
 * besoin, la feuille les habille deja.
 */
export function Heading({ children, level = 2, id, lang }: HeadingProps) {
  const Tag = level === 3 ? "h3" : "h2";
  return (
    <Tag className="h-md" id={id} lang={lang}>
      {children}
    </Tag>
  );
}
