/* Les pages de controle : chaque page du site, recomposee avec les
   composants du paquet. Elles servent a comparer le rendu du design
   system avec les pages reelles du site, cote a cote.

   Les chemins d'images pointent vers les assets du site : servir depuis
   la racine du depot (python -m http.server 8010) pour les voir. */

import type { ReactElement } from "react";
import {
  Actions,
  Album,
  ArchiveStrip,
  Band,
  BILLETTERIE_URL,
  Button,
  CANDIDATURE_URL,
  CONTACT_MAIL,
  DataLines,
  EditionFiche,
  EditionMeta,
  EditionNav,
  EditionRegister,
  EditionSlider,
  ErrorHero,
  Facts,
  FaqGroup,
  FaqItem,
  FinalCta,
  Heading,
  Hero,
  HofYear,
  Lead,
  LieuBlock,
  LinkMore,
  Moment,
  Notice,
  PageHead,
  PageShell,
  PartnersGrid,
  PeopleList,
  Prose,
  Section,
  Sheet,
  SpeakerCard,
  SpeakerGrid,
  SpeakerList,
  TalkFrame,
  TedxBlock,
  Timeline,
  VisuallyHidden
} from "../src/index";

export interface DemoPage {
  slug: string;
  title: string;
  element: ReactElement;
}

const bandBilletterie = (
  <Band
    title="La dixième ligne du registre s'écrira le 18 mars 2027."
    lead="Franchir ou s'adapter ? 750 fauteuils au Centre de Congrès de l'Aube pour en décider."
    note="Billetterie hébergée sur HelloAsso. Aucune donnée n'est collectée sur ce site."
  >
    <Actions>
      <Button href={BILLETTERIE_URL} external>
        Réserver ma place
      </Button>
    </Actions>
  </Band>
);

const AFFICHES = [
  { year: "2016", theme: "Shape the future", lang: "en", file: "2016/visuel.webp", w: 840, h: 840 },
  { year: "2017", theme: "To the Limits and Beyond", lang: "en", file: "2017/visuel.webp", w: 840, h: 840 },
  { year: "2019", theme: "Thinking outside the box", lang: "en", file: "2019/affiche.webp", w: 595, h: 842 },
  { year: "2021", theme: "Changing codes", lang: "en", file: "2021/affiche.webp", w: 840, h: 840 },
  { year: "2022", theme: "Circulation", file: "2022/affiche.webp", w: 840, h: 1188 },
  { year: "2023", theme: "Impacting our world", lang: "en", file: "2023/affiche.webp", w: 840, h: 1188 },
  { year: "2024", theme: "Le monde de demain", file: "2024/affiche.webp", w: 840, h: 1188 },
  { year: "2025", theme: "Réveiller l'avenir", file: "2025/affiche.webp", w: 840, h: 1188 },
  { year: "2026", theme: "Un futur à bâtir", file: "2026/affiche.webp", w: 840, h: 1233 }
];

/* ------------------------------------------------------------------ */

const accueil: DemoPage = {
  slug: "accueil",
  title: "Accueil",
  element: (
    <PageShell current="accueil" variant="journey">
      <Hero
        cote="Dixième édition"
        word="Franchir"
        sub={"ou s'adapter ?"}
        fig="la limite. Se franchit ou s'apprivoise mais ne s'ignore jamais."
        background={{ src: "/assets/img/editions/2024/galerie/05.webp", width: 1400, height: 933 }}
      >
        <Button href={BILLETTERIE_URL} external>
          Réserver ma place
        </Button>
        <Button href="/programme/" variant="ghost">
          Voir le programme
        </Button>
      </Hero>

      <Moment
        id="franchir"
        cote="Franchir"
        crossWord="Au-delà"
        title="Décider que la ligne était provisoire"
        lead="Le record tombe, le prototype décolle, une voix s'élève là où personne ne parlait. Franchir, c'est regarder la limite en face et passer outre : le mur devient une marche, la frontière un point de départ."
        photo={{
          src: "/assets/img/2.jpg",
          alt: "Le public de TEDxUTTroyes dans l'auditorium du Centre de Congrès de l'Aube",
          width: 3200,
          height: 2133
        }}
      />

      <Moment
        id="s-adapter"
        side="droite"
        cote="S'adapter"
        crossWord="Jusqu'ici"
        title="Ce qui ne se franchit pas"
        lead="Le corps compose avec la maladie, la ville avec sa rivière, l'ingénieur avec la matière. S'adapter, c'est faire de la ligne un appui : plier sans rompre, transformer la contrainte en méthode."
        photo={{
          src: "/assets/img/1.png",
          alt: "Jamy Gourmaud sur la scène de TEDxUTTroyes, devant les lettres rouges",
          width: 2560,
          height: 1440
        }}
      />

      <Moment
        id="speakers"
        cote="Speakers"
        title="Six noms s'apprêtent à franchir"
        lead="Le 18 mars, six talks racontent la limite depuis la scène troyenne : dix-huit minutes chacun, pas une de plus."
      >
        <SpeakerList
          entries={[
            { id: "Intervenant·e 01", redactions: ["4.5ch", "7ch"] },
            { id: "Intervenant·e 02", redactions: ["6ch", "5ch"] },
            { id: "Intervenant·e 03", redactions: ["5ch", "8.5ch"] },
            { id: "Intervenant·e 04", redactions: ["7.5ch", "4ch"] },
            { id: "Intervenant·e 05", redactions: ["5.5ch", "6.5ch"] },
            { id: "Intervenant·e 06", redactions: ["4ch", "9ch"] }
          ]}
        />
        <div className="colL more-row actions">
          <Button href="/devenir-speaker/" variant="ghost">
            Postuler comme speaker
          </Button>
          <LinkMore href="/speakers/">Ouvrir les six fiches</LinkMore>
        </div>
      </Moment>

      <Moment
        id="lieu"
        cote="Le lieu"
        title="Une salle au bord du canal"
        lead="La soirée compose avec son réel : une date, une salle, huit cents fauteuils. Le Centre de Congrès de l'Aube offre une scène unique et une acoustique dessinée pour la voix. Ici, la ligne plie."
      >
        <LieuBlock
          photo={{
            src: "/assets/img/lieu/centre-congres.webp",
            alt: "La foule devant le Centre de Congrès de l'Aube, à Troyes",
            width: 1280,
            height: 957
          }}
          facts={[
            { strong: "Jusqu'à 750 personnes", data: "configuration auditorium" },
            {
              strong: "À un quart d'heure à pied de la gare",
              data: "bus TCAT et parkings publics à proximité"
            }
          ]}
          carteHref="https://www.google.com/maps/search/?api=1&query=Centre+de+Congr%C3%A8s+de+l%27Aube+Troyes"
          caption="le Centre de Congrès de l'Aube, photo, plan de situation et carte"
        />
      </Moment>

      <Moment
        id="programme"
        cote="Programme"
        title="La soirée, réglée au quart d'heure"
        lead="Portes à 18h00 avec un mini forum de recrutement, première voix à 19h30, dernière question vers 22h40. La feuille de salle tient en sept temps."
      >
        <Timeline
          entries={[
            {
              time: "18h00",
              title: "Ouverture des portes et mini forum de recrutement",
              desc: "Dans le hall, les entreprises partenaires et les associations rencontrent le public : stages, alternances, premiers emplois.",
              photo: { src: "/assets/img/recrutement.webp", width: 980, height: 667 }
            },
            {
              time: "19h30",
              title: "Ouverture de la soirée",
              desc: "Le thème est posé : franchir ou s'adapter ?",
              photo: { src: "/assets/img/ouverture.png", width: 2600, height: 1529 }
            },
            {
              time: "19h45",
              title: "Première session de talks",
              desc: "Trois prises de parole en direct, une vidéo de conférence TED.",
              photo: { src: "/assets/img/talk1.png", width: 1600, height: 800 }
            },
            {
              time: "20h50",
              title: "Entracte",
              desc: "Trente minutes pour confronter les premières idées, un verre à la main.",
              photo: { src: "/assets/img/entracte.png", width: 1200, height: 600 }
            },
            {
              time: "21h20",
              title: "Seconde session de talks",
              desc: "Trois prises de parole pour finir de faire le tour de la ligne.",
              photo: { src: "/assets/img/talk2.png", width: 1600, height: 1066 }
            },
            {
              time: "22h30",
              title: "Pôt VIP",
              desc: "Un moment privilégié pour rencontrer les intervenantes et intervenants.",
              photo: { src: "/assets/img/cocktail.png", width: 1200, height: 600 }
            }
          ]}
        />
        <p className="more-row">
          <LinkMore href="/programme/">Lire la feuille de salle complète</LinkMore>
        </p>
      </Moment>

      <Moment
        id="dix-ans"
        variant="frise"
        cote="Dix ans"
        title="La ligne vient de loin"
        lead="Neuf éditions, une seule scène. En 2017, le thème s'appelait déjà To the Limits and Beyond : dix ans plus tard, la question revient."
      >
        <EditionSlider
          posters={AFFICHES.map((a) => ({
            src: `/assets/img/editions/${a.file}`,
            alt: `Affiche de l'édition ${a.year} : ${a.theme}`,
            width: a.w,
            height: a.h
          }))}
        />
        <p className="fr-caption">L'album des éditions · 2016 à 2027 · les affiches au fil de la ligne</p>
        <Album
          entries={AFFICHES.map((a) => ({
            year: a.year,
            theme: a.theme,
            lang: a.lang,
            poster: {
              src: `/assets/img/editions/${a.file}`,
              alt: `Affiche de l'édition ${a.year} : ${a.theme}`,
              width: a.w,
              height: a.h
            }
          }))}
          end={{
            year: "2027",
            theme: "Franchir ou s'adapter ?",
            note: "Dixième édition · 18 mars 2027 · vous êtes ici"
          }}
        />
        <ArchiveStrip
          photos={[
            { src: "/assets/img/editions/2024/galerie/01.webp", alt: "La scène du TEDxUTTroyes 2024", width: 1400, height: 933 },
            { src: "/assets/img/editions/2023/galerie/04.webp", alt: "Le public de l'édition 2023", width: 1400, height: 933 },
            { src: "/assets/img/editions/2024/galerie/03.webp", alt: "Un talk de l'édition 2024", width: 1400, height: 933 },
            { src: "/assets/img/editions/2023/galerie/07.webp", alt: "Karim Hechmi sur la scène de l'édition 2023", width: 1400, height: 933 },
            { src: "/assets/img/editions/2024/galerie/06.webp", alt: "Un moment de l'édition 2024", width: 1400, height: 933 },
            { src: "/assets/img/editions/2023/galerie/09.webp", alt: "L'équipe organisatrice de l'édition 2023", width: 1400, height: 933 }
          ]}
          caption="Pièces versées au dossier : les éditions 2023 et 2024 · photographies ©argentique utt"
        />
        <DataLines
          lines={[
            { value: "61", label: "talks partagés sur la scène troyenne depuis 2016" },
            { value: "2500", label: "intervenantes et intervenants passés par le plateau" },
            { value: "750", label: "fauteuils le 18 mars 2027, pas un de plus" }
          ]}
          ariaLabel="La dixième édition en chiffres"
        />
        <p className="colL more-row">
          <LinkMore href="/editions/">Ouvrir le registre des éditions</LinkMore>
        </p>
      </Moment>

      <TedxBlock />

      <FinalCta title="La salle s'arrête à 750 fauteuils. C'est la seule limite de la soirée que personne ne franchira." />
    </PageShell>
  )
};

/* ------------------------------------------------------------------ */

const speakers: DemoPage = {
  slug: "speakers",
  title: "Speakers",
  element: (
    <PageShell current="speakers">
      <PageHead
        cote="La scène 2027"
        title="Speakers"
        lead="Six fiches, six limites racontées en dix-huit minutes maximum. Les noms restent sous embargo : chaque annonce lèvera une barre noire, d'ici au printemps 2027."
      />

      <Section cote="Registre des annonces" ariaLabelledby="titre-speakers">
        <h2 className="visually-hidden" id="titre-speakers">
          Les six intervenants de l'édition 2027
        </h2>
        <SpeakerGrid>
          <SpeakerCard id="Intervenant·e 01" />
          <SpeakerCard
            id="Intervenant·e 02"
            redactions={{ name: ["6ch", "5ch"], bio: ["94%", "100%", "47%"], talk: "10ch" }}
          />
          <SpeakerCard
            id="Intervenant·e 03"
            redactions={{ name: ["5ch", "8.5ch"], bio: ["100%", "72%", "84%"], talk: "15ch" }}
          />
          <SpeakerCard
            id="Intervenant·e 04"
            redactions={{ name: ["7ch", "4ch"], bio: ["86%", "100%", "55%"], talk: "11ch" }}
          />
          <SpeakerCard
            id="Intervenant·e 05"
            redactions={{ name: ["5.5ch", "6.5ch"], bio: ["100%", "91%", "38%"], talk: "14ch" }}
          />
          <SpeakerCard
            id="Intervenant·e 06"
            redactions={{ name: ["4ch", "9ch"], bio: ["96%", "79%", "66%"], talk: "12ch" }}
          />
        </SpeakerGrid>
        <Notice>
          Pour être prévenu à chaque levée d'embargo : la newsletter, depuis la page
          d'accueil.
        </Notice>
      </Section>

      <Section cote="La scène est à vous" variant="alt" ariaLabelledby="titre-postuler">
        <Heading id="titre-postuler">{"Et si un de ces six noms était le vôtre ?"}</Heading>
        <Lead>
          Le comité de programme cherche des idées qui méritent d'être partagées, pas des
          CV. Racontez-nous la vôtre : l'équipe accompagne chaque speaker jusqu'à la scène.
        </Lead>
        <Actions>
          <Button href="/devenir-speaker/">Postuler comme speaker</Button>
        </Actions>
      </Section>

      <Band
        title="Chaque année, la salle se remplit avant la fin des annonces."
        lead="750 fauteuils, six inconnues, une soirée. Réserver maintenant, c'est parier sur dix ans d'exigence."
        note="Billetterie hébergée sur HelloAsso. Aucune donnée n'est collectée sur ce site."
      >
        <Actions>
          <Button href={BILLETTERIE_URL} external>
            Réserver ma place
          </Button>
          <Button href="/programme/" variant="ghost">
            Voir le programme
          </Button>
        </Actions>
      </Band>
    </PageShell>
  )
};

/* ------------------------------------------------------------------ */

const programme: DemoPage = {
  slug: "programme",
  title: "Programme",
  element: (
    <PageShell current="programme">
      <PageHead
        cote="Jeudi 18 mars 2027"
        title="Le programme"
        lead="Portes à 18h00 avec un mini forum de recrutement, première voix à 19h30, dernière question vers 22h40. Entre les deux : six talks, une vidéo TED, un entracte pour en débattre."
      />

      <Section cote="Feuille de salle" ariaLabelledby="titre-programme">
        <h2 className="visually-hidden" id="titre-programme">
          Déroulé de la soirée
        </h2>
        <Sheet
          entries={[
            {
              time: "18h00",
              title: "Ouverture des portes et mini forum de recrutement",
              desc: "Contrôle des billets, vestiaire, puis rencontre dans le hall avec les entreprises partenaires et les associations : stages, alternances, premiers emplois. CV bienvenus."
            },
            {
              time: "19h30",
              title: "Ouverture de la soirée",
              desc: "Le thème est posé : franchir ou s'adapter ?"
            },
            {
              time: "19h45",
              title: "Première session de talks",
              desc: "Trois prises de parole en direct, une vidéo de conférence TED."
            },
            {
              time: "20h50",
              title: "Entracte",
              desc: "Trente minutes pour confronter les premières idées, un verre à la main."
            },
            {
              time: "21h20",
              title: "Seconde session de talks",
              desc: "Trois prises de parole pour finir de faire le tour de la ligne."
            },
            {
              time: "22h30",
              title: "Pôt VIP",
              desc: "Un moment privilégié pour rencontrer les intervenantes et intervenants."
            }
          ]}
        />
        <Notice>
          Feuille de salle indicative : les horaires précis seront confirmés à l'approche du
          18 mars.
        </Notice>
      </Section>

      <Band
        title="La soirée commence à 18h00. Votre décision peut commencer maintenant."
        note="Billetterie hébergée sur HelloAsso. Aucune donnée n'est collectée sur ce site."
      >
        <Actions>
          <Button href={BILLETTERIE_URL} external>
            Réserver ma place
          </Button>
          <Button href="/faq/" variant="ghost">
            Lire la FAQ pratique
          </Button>
        </Actions>
      </Band>
    </PageShell>
  )
};

/* ------------------------------------------------------------------ */

const editions: DemoPage = {
  slug: "editions",
  title: "Registre des éditions",
  element: (
    <PageShell current="editions">
      <PageHead
        cote="Depuis 2016"
        title="Le registre des éditions"
        lead="Neuf éditions consignées, deux années blanches, des dizaines de talks en accès libre. De quoi mesurer le chemin parcouru avant d'écrire la dixième ligne."
      />

      <Section cote="Archives" ariaLabelledby="titre-editions">
        <h2 className="visually-hidden" id="titre-editions">
          Les neuf éditions passées
        </h2>
        <EditionRegister
          entries={[...AFFICHES].reverse().map((a) => ({
            year: a.year,
            theme: a.theme,
            lang: a.lang,
            href: `/editions/edition-${a.year}/`,
            thumb: `/assets/img/editions/${a.year}/vignette.webp`
          }))}
        />
        <Notice>
          2018 et 2020 manquent au registre : ces années-là, l'événement n'a pas eu lieu.
          Même une scène d'idées rencontre ses limites.
        </Notice>
      </Section>

      <Section cote="En vidéo" variant="alt">
        <Heading>Tous les talks, en accès libre</Heading>
        <Lead>
          Chaque talk de TEDxUTTroyes est filmé puis publié sur la chaîne YouTube TEDx
          Talks, aux côtés de ceux de milliers d'événements TEDx dans le monde.
        </Lead>
        <Actions>
          <Button href="https://www.youtube.com/@TEDx" variant="ghost" external withIcon>
            Ouvrir la chaîne TEDx Talks
          </Button>
        </Actions>
      </Section>

      <Band
        title="Le registre attend sa dixième ligne."
        lead="Elle s'écrira le 18 mars 2027, devant 750 personnes."
        note="Billetterie hébergée sur HelloAsso. Aucune donnée n'est collectée sur ce site."
      >
        <Actions>
          <Button href={BILLETTERIE_URL} external>
            Réserver ma place
          </Button>
        </Actions>
      </Band>
    </PageShell>
  )
};

/* ------------------------------------------------------------------ */

const edition2016: DemoPage = {
  slug: "edition-2016",
  title: "Édition 2016",
  element: (
    <PageShell current="editions">
      <PageHead
        cote="Édition n° 01 · 2016"
        title="Shape the future"
        lang="en"
        meta={
          <EditionMeta
            datetime="2016-11-23"
            items={["Mercredi 23 novembre 2016", "Université de Technologie de Troyes", "7 talks"]}
          />
        }
        lead="La première ligne du registre. En 2016, une poignée d'étudiants de l'UTT obtient la licence TEDx et installe une scène rouge à Troyes : sept speakers, un thème tourné vers le futur, et une habitude prise."
      />

      <Section cote="La fiche" bodyClassName="ed-fiche" ariaLabelledby="titre-fiche-2016">
        <EditionFiche
          poster={{
            src: "/assets/img/editions/2016/visuel.webp",
            alt: "La scène de la première édition : le thème Shape the future projeté au-dessus des lettres TEDxUTTroyes",
            width: 840,
            height: 840
          }}
          caption="Document : la scène de la première édition, le 23 novembre 2016"
        >
          <Heading id="titre-fiche-2016">Le thème</Heading>
          <p>
            Axée sur l'action et l'impact de nos choix actuels, cette édition se penche sur
            la manière dont nous modelons activement le monde de demain.
          </p>
          <p>
            Première ligne du registre, le mercredi 23 novembre 2016 : c'est elle qui a
            ouvert la voie aux éditions suivantes.
          </p>
          <Facts
            items={[
              { strong: "23 novembre 2016", data: "édition n° 1 sur 10" },
              { strong: "Université de Technologie de Troyes", data: "le lieu de cette édition" },
              { strong: "7 talks", data: "publiés sur la chaîne TEDx Talks" }
            ]}
          />
          <p className="more-row">
            <LinkMore
              href="https://www.youtube.com/results?search_query=TEDxUTTroyes+2016"
              external
            >
              voir les talks 2016 sur YouTube
            </LinkMore>
          </p>
        </EditionFiche>
      </Section>

      <Section cote="À la tribune" variant="alt" ariaLabelledby="titre-speakers-2016">
        <Heading id="titre-speakers-2016">Elles et ils ont pris la parole</Heading>
        <PeopleList
          people={[
            { name: "Gilles Mautin", href: "/speakers/2016/gilles-mautin/", photo: "/assets/img/editions/2016/speakers/gilles-mautin.webp" },
            { name: "Boris Guiffot", href: "/speakers/2016/boris-guiffot/", photo: "/assets/img/editions/2016/speakers/boris-guiffot.webp" },
            { name: "Davy Rey", href: "/speakers/2016/davy-rey/", photo: "/assets/img/editions/2016/speakers/davy-rey.webp" },
            { name: "Darja Dubravcic", href: "/speakers/2016/darja-dubravcic/", photo: "/assets/img/editions/2016/speakers/darja-dubravcic.webp" },
            { name: "Pierre Collet", href: "/speakers/2016/pierre-collet/", photo: "/assets/img/editions/2016/speakers/pierre-collet.webp" },
            { name: "Karim Oumnia", href: "/speakers/2016/karim-oumnia/", photo: "/assets/img/editions/2016/speakers/karim-oumnia.webp" },
            { name: "Adnan Maalaoui", href: "/speakers/2016/adnan-maalaoui/", photo: "/assets/img/editions/2016/speakers/adnan-maalaoui.webp" }
          ]}
        />
      </Section>

      <Section cote="Le registre" bodyClassName="ed-nav" ariaLabel="Naviguer dans le registre">
        <EditionNav
          voidLabel="début du registre"
          links={[
            { label: "tout le registre", href: "/editions/" },
            { label: "édition 2017 : To the Limits and Beyond", href: "/editions/edition-2017/" }
          ]}
        />
      </Section>

      {bandBilletterie}
    </PageShell>
  )
};

/* ------------------------------------------------------------------ */

const speakerArchive: DemoPage = {
  slug: "speaker-archive",
  title: "Fiche speaker d'archive",
  element: (
    <PageShell current="editions">
      <PageHead
        cote="Édition 2019 · Thinking outside the box"
        title="Alexandre Dana"
        lead="À travers son talk, il vous poussera à une réflexion sur la pédagogie et sur notre modèle éducatif."
      />

      <Section cote="Présentation" bodyClassName="ed-fiche" ariaLabelledby="titre-bio">
        <EditionFiche
          lazy
          poster={{
            src: "/assets/img/editions/2019/speakers/alexandre-dana.webp",
            alt: "Portrait de Alexandre Dana",
            width: 560,
            height: 560
          }}
          caption="Alexandre Dana · TEDxUTTroyes 2019"
        >
          <h2 className="visually-hidden" id="titre-bio">
            Biographie
          </h2>
          <p className="ed-meta">Domaine : entrepreneuriat</p>
          <p>
            Alexandre Dana est le fondateur et CEO de LiveMentor, la première école en ligne
            pour entrepreneurs en France. Il crée sa première entreprise durant ses études à
            20 ans.
          </p>
          <p>
            Passionné d'éducation, il dévore tous les ouvrages de référence avant de lancer
            son projet.
          </p>
        </EditionFiche>
      </Section>

      <Section cote="Le talk" variant="alt" ariaLabelledby="titre-talk">
        <Heading id="titre-talk">Alexandre au TEDxUTTroyes 2019</Heading>
        <Lead>« Apprendre à entreprendre : quelle drôle d'idée »</Lead>
        <TalkFrame videoId="zP3BkpaMpaU" title="Vidéo : Alexandre au TEDxUTTroyes 2019" />
        <Actions>
          <Button href="https://www.youtube.com/watch?v=zP3BkpaMpaU" variant="ghost" external withIcon>
            Voir le talk sur YouTube
          </Button>
        </Actions>
      </Section>

      <Section cote="Registre" bodyClassName="ed-nav">
        <EditionNav
          ariaLabel="Navigation dans les archives"
          links={[
            { label: "Retour à l'édition 2019", href: "/editions/edition-2019/" },
            { label: "Toutes les éditions", href: "/editions/" }
          ]}
        />
      </Section>

      {bandBilletterie}
    </PageShell>
  )
};

/* ------------------------------------------------------------------ */

const hallOfFame: DemoPage = {
  slug: "hall-of-fame",
  title: "Hall of Fame",
  element: (
    <PageShell current="hall-of-fame">
      <PageHead
        cote="Registre des voix"
        title="Hall of Fame"
        lead="Toutes les voix passées par la scène de TEDxUTTroyes, année par année : 61 interventions consignées de 2016 à 2026."
      />

      <Section cote="Archives">
        <HofYear
          year="2026"
          theme="Un futur à bâtir"
          href="/editions/edition-2026/"
          people={[
            { name: "Alban Michon", href: "/speakers/2026/alban-michon/", photo: "/assets/img/editions/2026/speakers/alban-michon.webp" },
            { name: "Daniella Tchana", href: "/speakers/2026/daniella-tchana/", photo: "/assets/img/editions/2026/speakers/daniella-tchana.webp" },
            { name: "Franck Robin", href: "/speakers/2026/franck-robin/", photo: "/assets/img/editions/2026/speakers/franck-robin.webp" },
            { name: "Jean-Marie Simon", href: "/speakers/2026/jean-marie-simon/", photo: "/assets/img/editions/2026/speakers/jean-marie-simon.webp" },
            { name: "Jean-Michel Adélaïde", href: "/speakers/2026/jean-michel-adelaide/", photo: "/assets/img/editions/2026/speakers/jean-michel-adelaide.webp" },
            { name: "Nicolas Dehandschoewercker", href: "/speakers/2026/nicolas-dehandschoewercker/", photo: "/assets/img/editions/2026/speakers/nicolas-dehandschoewercker.webp" }
          ]}
        />
        <HofYear
          year="2016"
          theme="Shape the future"
          href="/editions/edition-2016/"
          people={[
            { name: "Gilles Mautin", href: "/speakers/2016/gilles-mautin/", photo: "/assets/img/editions/2016/speakers/gilles-mautin.webp" },
            { name: "Boris Guiffot", href: "/speakers/2016/boris-guiffot/", photo: "/assets/img/editions/2016/speakers/boris-guiffot.webp" },
            { name: "Davy Rey", href: "/speakers/2016/davy-rey/", photo: "/assets/img/editions/2016/speakers/davy-rey.webp" }
          ]}
        />
      </Section>
    </PageShell>
  )
};

/* ------------------------------------------------------------------ */

const partenaires: DemoPage = {
  slug: "partenaires",
  title: "Partenaires",
  element: (
    <PageShell current="partenaires">
      <PageHead
        cote="Ils s'engagent"
        title="Partenaires"
        lead="TEDxUTTroyes ne vend rien : l'événement est à but non lucratif, porté par les bénévoles de Genius UTT. Chaque édition tient debout grâce à des partenaires qui partagent le goût des idées."
      />

      <Section cote="Édition 2027" ariaLabelledby="titre-partenaires">
        <h2 className="visually-hidden" id="titre-partenaires">
          Les partenaires de l'édition 2027
        </h2>
        <PartnersGrid
          partners={[
            { name: "Université de Technologie de Troyes", logo: "/assets/img/partenaires/logo-utt.webp", href: "https://www.utt.fr/", width: 233, height: 240 },
            { name: "Fondation UTT", logo: "/assets/img/partenaires/logo-fondation-utt.webp", href: "https://fondation-utt.odoo.com/", width: 600, height: 169 },
            { name: "Genius UTT", logo: "/assets/img/partenaires/logo-genius-utt.webp", href: "https://www.instagram.com/geniusutt/", width: 240, height: 240 },
            { name: "BDE Genius UTT", logo: "/assets/img/partenaires/logo-bde.webp", href: "https://bde.utt.fr/", width: 240, height: 240 },
            { name: "Troyes Champagne Métropole", logo: "/assets/img/partenaires/logo-troyes.webp", href: "https://troyes-champagne-metropole.fr/", width: 500, height: 196 },
            { name: "Les Aubassadeurs", logo: "/assets/img/partenaires/logo-aube.webp", href: "https://www.aubassadeurs.fr/", width: 406, height: 240 },
            { name: "TCAT", logo: "/assets/img/partenaires/logo-tcat.webp", href: "https://tcat.fr/", width: 240, height: 240 },
            { name: "Crous de Reims", logo: "/assets/img/partenaires/logo-crous-reims.webp", href: "https://www.crous-reims.fr/", width: 200, height: 200 }
          ]}
        />
      </Section>

      <Section cote="Rejoindre l'aventure" variant="alt">
        <Heading>Devenir partenaire</Heading>
        <Lead>
          Associez votre structure à 750 spectateurs le soir même, à des talks vus bien
          au-delà de Troyes ensuite, et à dix ans d'histoire locale.
        </Lead>
        <Actions>
          <Button href={`mailto:${CONTACT_MAIL}?subject=Partenariat%20TEDxUTTroyes%202027`}>
            Proposer un partenariat
          </Button>
        </Actions>
      </Section>
    </PageShell>
  )
};

/* ------------------------------------------------------------------ */

const aPropos: DemoPage = {
  slug: "a-propos",
  title: "À propos",
  element: (
    <PageShell current="a-propos">
      <PageHead
        cote="L'esprit"
        title="À propos"
        lead="Un événement local, une licence internationale, une même conviction : les idées méritent d'être partagées."
      />

      <Section cote="TED, TEDx, Troyes">
        <Prose>
          <h2>À propos de TED</h2>
          <p>
            TED est une organisation à but non lucratif consacrée aux idées qui méritent
            d'être partagées, le plus souvent sous la forme de talks courts et percutants de
            moins de 18 minutes.
          </p>
          <h2>À propos de TEDxUTTroyes</h2>
          <p>
            TEDxUTTroyes est organisé par les étudiantes et étudiants de{" "}
            <strong>Genius UTT</strong>, association de l'Université de Technologie de
            Troyes.
          </p>
        </Prose>
        <Actions>
          <Button href="https://www.ted.com/tedx" variant="ghost" external withIcon>
            Le programme TEDx : ted.com/tedx
          </Button>
          <Button href="https://www.ted.com" variant="ghost" external withIcon>
            Découvrir TED : ted.com
          </Button>
        </Actions>
      </Section>

      <Band
        title="Les talks se regardent en ligne. Les idées se vivent en salle."
        note="Billetterie hébergée sur HelloAsso. Aucune donnée n'est collectée sur ce site."
      >
        <Actions>
          <Button href={BILLETTERIE_URL} external>
            Réserver ma place
          </Button>
        </Actions>
      </Band>
    </PageShell>
  )
};

/* ------------------------------------------------------------------ */

const faq: DemoPage = {
  slug: "faq",
  title: "FAQ",
  element: (
    <PageShell current="faq">
      <PageHead
        cote="Infos pratiques"
        title="FAQ"
        lead="Billets, horaires, accès au Centre de Congrès de l'Aube : les réponses aux questions qui reviennent. Il en manque une ? Écrivez-nous."
      />

      <Section cote="Questions, réponses">
        <FaqGroup title="Billetterie">
          <FaqItem question="Comment réserver ma place ?">
            <p>
              La billetterie est hébergée sur HelloAsso : cliquez sur « Réserver ma place »
              depuis n'importe quelle page du site.
            </p>
          </FaqItem>
          <FaqItem question="Combien coûte un billet ?">
            <p>
              Les tarifs de la dixième édition seront annoncés à l'ouverture de la
              billetterie.
            </p>
          </FaqItem>
        </FaqGroup>

        <FaqGroup title="Accès">
          <FaqItem question="L'accès est-il possible en fauteuil roulant ?">
            <p>
              Oui, la salle est accessible aux personnes à mobilité réduite. Signalez votre
              venue par e-mail pour que l'équipe prépare au mieux votre accueil.
            </p>
          </FaqItem>
        </FaqGroup>
      </Section>

      <Band cote="Contact" title="Une autre question ?" lead="L'équipe de Genius UTT répond par e-mail, sans formulaire ni robot.">
        <Actions>
          <Button href={`mailto:${CONTACT_MAIL}`}>Nous écrire</Button>
        </Actions>
      </Band>
    </PageShell>
  )
};

/* ------------------------------------------------------------------ */

const devenirSpeaker: DemoPage = {
  slug: "devenir-speaker",
  title: "Devenir speaker",
  element: (
    <PageShell>
      <PageHead
        cote="La scène est à vous"
        title="Devenir speaker"
        lead="Le 18 mars 2027, six personnes monteront sur la scène du Centre de Congrès de l'Aube pour dix-huit minutes chacune, face à 750 fauteuils."
      />

      <Section cote="Ce qu'on cherche" ariaLabelledby="titre-attendu">
        <Heading id="titre-attendu">Une idée, pas un CV</Heading>
        <Lead>
          Un talk TEDx ne vend rien et ne promeut personne : il transmet une idée. Peu
          importe votre notoriété, votre métier ou votre âge.
        </Lead>
        <Facts
          items={[
            { strong: "Une idée neuve ou un regard neuf", data: "un angle que le public n'a pas déjà entendu cent fois" },
            { strong: "Dix-huit minutes, pas une de plus", data: "le format TED, exigeant et libérateur" },
            { strong: "Un lien avec le thème 2027", data: "franchir ou s'adapter : la limite, sous toutes ses formes" },
            { strong: "De l'envie, pas de l'expérience", data: "l'équipe vous accompagne : coaching, répétitions, écriture" }
          ]}
        />
      </Section>

      <Section cote="Candidater" variant="alt" ariaLabelledby="titre-candidater">
        <Heading id="titre-candidater">Trois paragraphes suffisent</Heading>
        <Lead>
          Présentez votre idée en quelques lignes dans le formulaire de candidature : en
          quoi elle est nouvelle ou nécessaire, et un mot sur vous.
        </Lead>
        <Actions>
          <Button href={CANDIDATURE_URL} external>
            Postuler comme speaker
          </Button>
        </Actions>
        <Notice>
          Vous connaissez quelqu'un qui devrait monter sur cette scène ? Transmettez-lui
          cette page.
        </Notice>
      </Section>
    </PageShell>
  )
};

/* ------------------------------------------------------------------ */

const mentions: DemoPage = {
  slug: "mentions-legales",
  title: "Mentions légales",
  element: (
    <PageShell>
      <PageHead cote="Le cadre" title="Mentions légales" />

      <Section cote="Document">
        <Prose>
          <h2>Éditeur du site</h2>
          <p>
            Le site tedxuttroyes.fr est édité par l'association <strong>Genius UTT</strong>,
            association étudiante de l'Université de Technologie de Troyes.
          </p>
          <h2>Données personnelles et cookies</h2>
          <p>
            Ce site ne dépose aucun cookie, n'embarque aucun outil de mesure d'audience et
            ne collecte aucune donnée personnelle.
          </p>
        </Prose>
      </Section>
    </PageShell>
  )
};

/* ------------------------------------------------------------------ */

const erreur: DemoPage = {
  slug: "404",
  title: "Page 404",
  element: (
    /* La 404 est la seule page du site sans pied de page. */
    <PageShell footer={false}>
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
    </PageShell>
  )
};

/* ------------------------------------------------------------------
   Les gabarits d'annonce. Sur le site, ces etats vivent en commentaire
   dans le HTML (« GABARIT : pour annoncer un speaker... ») : aucune
   page ne les rend encore, puisque les six noms sont sous embargo.
   Cette page de controle les rend pour de vrai, pour verifier que les
   composants savent lever un embargo.
   ------------------------------------------------------------------ */

const gabarits: DemoPage = {
  slug: "gabarits",
  title: "Gabarits d'annonce",
  element: (
    <PageShell current="speakers">
      <PageHead
        cote="Contrôle"
        title="Gabarits d'annonce"
        lead="Les mêmes composants, une fois l'embargo levé : la fiche et la ligne de registre passent en état annoncé."
      />

      <Section cote="Fiche annoncée">
        <SpeakerGrid>
          <SpeakerCard
            id="Intervenant·e 01"
            name="Prénom Nom"
            bio="Mini bio en une ou deux phrases : qui parle, depuis quelle expérience."
            talk="Le titre du talk"
            photo={{
              src: "/assets/img/editions/2026/speakers/alban-michon.webp",
              alt: "Portrait de Prénom Nom"
            }}
          />
          <SpeakerCard id="Intervenant·e 02" />
        </SpeakerGrid>
      </Section>

      <Section cote="Registre de l'accueil" variant="alt">
        <SpeakerList
          entries={[
            {
              id: "Intervenant·e 01",
              name: "Prénom Nom",
              photo: "/assets/img/editions/2026/speakers/alban-michon.webp"
            },
            { id: "Intervenant·e 02" }
          ]}
        />
      </Section>
    </PageShell>
  )
};

export const PAGES: DemoPage[] = [
  accueil,
  speakers,
  programme,
  editions,
  edition2016,
  speakerArchive,
  hallOfFame,
  partenaires,
  aPropos,
  faq,
  devenirSpeaker,
  mentions,
  erreur,
  gabarits
];
