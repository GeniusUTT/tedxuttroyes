import { EditionNav, Section } from "@tedxuttroyes/design-system";

/** Au milieu du registre : une edition avant, une apres. */
export function AuMilieu() {
  return (
    <Section cote="Le registre" bodyClassName="ed-nav">
      <EditionNav
        links={[
          { label: "édition 2016 : Shape the future", href: "/editions/edition-2016/" },
          { label: "tout le registre", href: "/editions/" },
          {
            label: "édition 2019 : Thinking outside the box",
            href: "/editions/edition-2019/"
          }
        ]}
      />
    </Section>
  );
}

/** Au bout du registre : la mention remplace le lien manquant. */
export function DebutDuRegistre() {
  return (
    <Section cote="Le registre" bodyClassName="ed-nav">
      <EditionNav
        voidLabel="début du registre"
        links={[
          { label: "tout le registre", href: "/editions/" },
          {
            label: "édition 2017 : To the Limits and Beyond",
            href: "/editions/edition-2017/"
          }
        ]}
      />
    </Section>
  );
}

/** Depuis une fiche de speaker d'archive : retour a l'edition. */
export function DepuisUneFiche() {
  return (
    <Section cote="Registre" bodyClassName="ed-nav">
      <EditionNav
        ariaLabel="Navigation dans les archives"
        links={[
          { label: "Retour à l'édition 2019", href: "/editions/edition-2019/" },
          { label: "Toutes les éditions", href: "/editions/" }
        ]}
      />
    </Section>
  );
}
