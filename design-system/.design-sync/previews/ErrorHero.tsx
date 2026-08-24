import { Actions, Button, ErrorHero } from "@tedxuttroyes/design-system";

/** La page 404 du site : le code en grand, la sortie de secours dessous. */
export function Erreur404() {
  return (
    <ErrorHero
      title="Cette page est hors limite"
      lead="L'adresse demandée n'existe pas, ou n'existe plus. Reprenons depuis la ligne de départ."
    >
      <Actions>
        <Button href="/">Retour à l'accueil</Button>
        <Button href="/faq/" variant="ghost">
          Consulter la FAQ
        </Button>
      </Actions>
    </ErrorHero>
  );
}

/** Un autre code : le composant prend le chiffre en prop. */
export function Erreur500() {
  return (
    <ErrorHero
      code="500"
      cote="Erreur 500"
      title="La ligne est momentanément coupée"
      lead="Le serveur n'a pas pu répondre. Réessayez dans un instant."
    >
      <Actions>
        <Button href="/">Retour à l'accueil</Button>
      </Actions>
    </ErrorHero>
  );
}
