import { Prose } from "@tedxuttroyes/design-system";

/**
 * Le bloc de texte long : les titres, paragraphes et liens sont habilles
 * par la feuille, sans classe sur chaque element.
 */
export function TexteLong() {
  return (
    <Prose>
      <h2>À propos de TED</h2>
      <p>
        TED est une organisation à but non lucratif consacrée aux idées qui méritent
        d'être partagées, le plus souvent sous la forme de talks courts et percutants de
        moins de 18 minutes. TED a vu le jour en 1984, comme une conférence à la croisée
        de la technologie, du divertissement et du design.
      </p>
      <h2>À propos de TEDxUTTroyes</h2>
      <p>
        TEDxUTTroyes est organisé par les étudiantes et étudiants de{" "}
        <strong>Genius UTT</strong>, association de l'Université de Technologie de Troyes.
        Depuis 2016, l'équipe fait monter sur la scène troyenne des scientifiques, des
        sportifs, des entrepreneurs et des artistes.
      </p>
    </Prose>
  );
}

/** Un document reglementaire : les mentions legales. */
export function Document() {
  return (
    <Prose>
      <h2>Données personnelles et cookies</h2>
      <p>
        Ce site ne dépose aucun cookie, n'embarque aucun outil de mesure d'audience et ne
        collecte aucune donnée personnelle. Aucune bannière de consentement n'est donc
        nécessaire.
      </p>
      <p>
        Les contenus de ce site sont la propriété de leurs auteurs respectifs et ne
        peuvent être réutilisés sans autorisation. Écrire à{" "}
        <a href="mailto:geniusutt@utt.fr">geniusutt@utt.fr</a>.
      </p>
    </Prose>
  );
}
