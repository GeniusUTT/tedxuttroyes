import { Redact } from "@tedxuttroyes/design-system";

/**
 * Un nom sous embargo : deux barres, largeurs en caracteres. Varier les
 * largeurs d'une fiche a l'autre, un registre caviarde n'a jamais deux
 * lignes identiques.
 */
export function Nom() {
  return (
    <p className="sp-name" aria-hidden="true">
      <Redact width="4.5ch" />
      <Redact width="7ch" />
    </p>
  );
}

/** Une biographie sous embargo : trois barres, largeurs en pourcentage. */
export function Biographie() {
  return (
    <p className="sp-bio" aria-hidden="true">
      <Redact width="100%" />
      <Redact width="88%" />
      <Redact width="61%" />
    </p>
  );
}

/** Le titre d'un talk, caviarde derriere son intitule. */
export function Talk() {
  return (
    <p className="sp-talk">
      <span className="sp-talk-k">Talk</span> <Redact width="13ch" />
    </p>
  );
}
