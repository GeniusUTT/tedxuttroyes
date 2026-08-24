/**
 * Le plan de situation, dessine a la main : le quartier du Centre de
 * Congres de l'Aube reduit a ses rues, son canal et deux reperes.
 *
 * C'est la version par defaut du bloc lieu, celle qui s'affiche sans
 * JavaScript, sans WebGL et hors du site. La carte Mapbox du site vient
 * par dessus, chargee paresseusement ; elle n'a pas sa place ici : le
 * design system n'emet aucune requete externe.
 */
export function PlanLieu() {
  return (
    <svg
      className="lieu-plan"
      viewBox="0 0 240 330"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <rect className="pl-bg" width="240" height="330" />
      <g className="pl-rue pl-rue--fine">
        <path d="M96 0 L150 92" />
        <path d="M150 0 L204 62" />
        <path d="M104 118 L96 330" />
        <path d="M0 290 L240 268" />
      </g>
      <g className="pl-rue">
        <path d="M0 52 L240 30" />
        <path d="M34 0 L58 330" />
        <path d="M0 232 L240 210" />
      </g>
      <path
        className="pl-canal"
        d="M168 0 C158 60 176 120 164 190 C156 240 174 290 168 330"
      />
      <text className="pl-txt" x="66" y="42" transform="rotate(-5 66 42)">
        bd danton
      </text>
      <text className="pl-txt" x="40" y="96" transform="rotate(86 40 96)">
        rue de la paix
      </text>
      <text className="pl-txt" x="64" y="226" transform="rotate(-5 64 226)">
        rue charles gros
      </text>
      <text className="pl-txt" x="92" y="206" transform="rotate(88 92 206)">
        rue louis ulbach
      </text>
      <text className="pl-txt pl-txt--poi" x="14" y="140">
        théâtre de
      </text>
      <text className="pl-txt pl-txt--poi" x="14" y="151">
        champagne
      </text>
      <text className="pl-txt pl-txt--poi" x="188" y="98">
        cathédrale
      </text>
      <text className="pl-txt pl-txt--poi" x="186" y="158" transform="rotate(84 186 158)">
        le canal
      </text>
      <circle className="pl-ici-dot" cx="146" cy="178" r="6" />
      <text className="pl-txt pl-txt--ici" x="58" y="182">
        vous êtes ici
      </text>
      <rect className="pl-fig" y="306" width="240" height="24" />
      <text className="pl-txt" x="10" y="321">
        fig. 02 · plan de situation
      </text>
    </svg>
  );
}
