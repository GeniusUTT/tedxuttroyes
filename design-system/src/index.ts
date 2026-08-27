/* Le design system TEDxUTTroyes 2027 : les composants du site, empaquetes.
   Aucun style n'est redefini ici, la feuille du site fait foi. */

export * from "./types";

/* Gabarit de page */
export * from "./shell/PageShell";
export * from "./shell/SiteHeader";
export * from "./shell/SiteFooter";
export * from "./shell/Section";
export * from "./shell/PageHead";
export * from "./shell/Band";

/* La marque de la dixieme edition */
export * from "./marque/Marque10";

/* Briques de base */
export * from "./base/Button";
export * from "./base/LinkMore";
export * from "./base/Icon";
export * from "./base/Heading";
export * from "./base/Cote";
export * from "./base/Lead";
export * from "./base/Prose";
export * from "./base/Notice";
export * from "./base/Actions";
export * from "./base/Facts";
export * from "./base/Redact";
export * from "./base/VisuallyHidden";

/* Accueil : les stations de la ligne continue */
export * from "./accueil/Hero";
export * from "./accueil/Ticker";
export * from "./accueil/Moment";
export * from "./accueil/SpeakerList";
export * from "./accueil/LieuBlock";
export * from "./accueil/PlanLieu";
export * from "./accueil/Timeline";
export * from "./accueil/Album";
export * from "./accueil/EditionSlider";
export * from "./accueil/ArchiveStrip";
export * from "./accueil/DataLines";
export * from "./accueil/TedxBlock";
export * from "./accueil/FinalCta";

/* Speakers */
export * from "./speakers/SpeakerGrid";
export * from "./speakers/SpeakerCard";
export * from "./speakers/TalkFrame";

/* Editions */
export * from "./editions/EditionRegister";
export * from "./editions/EditionFiche";
export * from "./editions/EditionMeta";
export * from "./editions/EditionNav";
export * from "./editions/PeopleList";

/* Hall of Fame */
export * from "./hallOfFame/HofYear";

/* Programme */
export * from "./programme/Sheet";

/* Partenaires */
export * from "./partenaires/PartnersGrid";

/* FAQ */
export * from "./faq/FaqGroup";
export * from "./faq/FaqItem";

/* Erreur */
export * from "./erreur/ErrorHero";
