import { Album } from "@tedxuttroyes/design-system";
import {
  AFFICHE_2016,
  AFFICHE_2017,
  AFFICHE_2019,
  AFFICHE_2021,
  AFFICHE_2022,
  AFFICHE_2023,
  AFFICHE_2024,
  AFFICHE_2025,
  AFFICHE_2026
} from "./_images";

/* Les neuf editions passees, dans l'ordre. L'album repartit ses
   stations sur autant de colonnes qu'il a d'entrees : le nourrir avec
   trop peu d'affiches ecrase les etiquettes les unes sur les autres. */
const EDITIONS = [
  { year: "2016", theme: "Shape the future", lang: "en", src: AFFICHE_2016, h: 840 },
  { year: "2017", theme: "To the Limits and Beyond", lang: "en", src: AFFICHE_2017, h: 840 },
  { year: "2019", theme: "Thinking outside the box", lang: "en", src: AFFICHE_2019, h: 842 },
  { year: "2021", theme: "Changing codes", lang: "en", src: AFFICHE_2021, h: 840 },
  { year: "2022", theme: "Circulation", src: AFFICHE_2022, h: 1188 },
  { year: "2023", theme: "Impacting our world", lang: "en", src: AFFICHE_2023, h: 1188 },
  { year: "2024", theme: "Le monde de demain", src: AFFICHE_2024, h: 1188 },
  { year: "2025", theme: "Réveiller l'avenir", src: AFFICHE_2025, h: 1188 },
  { year: "2026", theme: "Un futur à bâtir", src: AFFICHE_2026, h: 1233 }
];

const entrees = EDITIONS.map((e) => ({
  year: e.year,
  theme: e.theme,
  lang: e.lang,
  poster: {
    src: e.src,
    alt: `Affiche de l'édition ${e.year} : ${e.theme}`,
    width: 840,
    height: e.h
  }
}));

/**
 * L'album des editions : les affiches pendent sur le fil rouge comme des
 * tirages sur une corde, le theme sous chacune. La derniere station est
 * l'edition a venir, d'ou le trait redescend vers la billetterie.
 */
export function NeufEditions() {
  return (
    <Album
      entries={entrees}
      end={{
        year: "2027",
        theme: "Franchir ou s'adapter ?",
        note: "Dixième édition · 18 mars 2027 · vous êtes ici"
      }}
    />
  );
}

/** Sans station finale : l'album s'arrete a la derniere affiche parue. */
export function SansStationFinale() {
  return <Album entries={entrees} />;
}
