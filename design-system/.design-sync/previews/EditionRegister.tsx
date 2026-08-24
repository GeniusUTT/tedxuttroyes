import { EditionRegister } from "@tedxuttroyes/design-system";
import {
  VIGNETTE_2021,
  VIGNETTE_2023,
  VIGNETTE_2024,
  VIGNETTE_2025,
  VIGNETTE_2026
} from "./_images";

/* Chaque vignette est celle de son edition : un registre qui montre la
   mauvaise archive en face d'une annee n'est plus un registre. */

/** Le registre : une ligne par annee, de la plus recente a la plus ancienne. */
export function Registre() {
  return (
    <EditionRegister
      entries={[
        {
          year: "2026",
          theme: "Un futur à bâtir",
          href: "/editions/edition-2026/",
          thumb: VIGNETTE_2026
        },
        {
          year: "2025",
          theme: "Réveiller l'avenir",
          href: "/editions/edition-2025/",
          thumb: VIGNETTE_2025
        },
        {
          year: "2024",
          theme: "Le monde de demain",
          href: "/editions/edition-2024/",
          thumb: VIGNETTE_2024
        }
      ]}
    />
  );
}

/** Un theme en anglais : la langue est portee par l'attribut lang. */
export function ThemeAnglais() {
  return (
    <EditionRegister
      entries={[
        {
          year: "2023",
          theme: "Impacting our world",
          lang: "en",
          href: "/editions/edition-2023/",
          thumb: VIGNETTE_2023
        },
        {
          year: "2021",
          theme: "Changing codes",
          lang: "en",
          href: "/editions/edition-2021/",
          thumb: VIGNETTE_2021
        }
      ]}
    />
  );
}

/** Sans vignette : la ligne se lit quand meme, l'annee et le theme suffisent. */
export function SansVignette() {
  return (
    <EditionRegister
      entries={[
        { year: "2017", theme: "To the Limits and Beyond", lang: "en", href: "#" },
        { year: "2016", theme: "Shape the future", lang: "en", href: "#" }
      ]}
    />
  );
}
