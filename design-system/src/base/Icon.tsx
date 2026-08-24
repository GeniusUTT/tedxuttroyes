/** Les trois seules icones du site : un chevron droit (liens internes),
 *  un chevron bas (depliants de la FAQ) et une fleche sortante (liens
 *  externes). Trait seul, jamais de remplissage. */
export type IconName = "chevron-right" | "chevron-down" | "external";

const PATHS: Record<IconName, string> = {
  "chevron-right": "M9 18l6-6-6-6",
  "chevron-down": "M6 9l6 6 6-6",
  external: "M7 17L17 7M9 7h8v8"
};

export interface IconProps {
  /** Le trace a utiliser. */
  name: IconName;
}

export function Icon({ name }: IconProps) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}
