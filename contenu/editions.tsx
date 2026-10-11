import type { ReactNode } from 'react';
import { Masque } from '../app/_site/Masque';

// Le registre des éditions passées, de la plus ancienne à la plus récente.
// Extrait le 2026-10-11 des pages HTML écrites à la main ; c'est désormais ici
// qu'on le retouche. L'ordre compte : il donne les éditions voisines en bas de
// chaque fiche. Les speakers sont désignés par leur slug (contenu/speakers.tsx).

export type Membre = {
  nom: string;
  portrait: string;
  largeur: number;
  hauteur: number;
  // Le profil LinkedIn ; jamais d'e-mail personnel sur le site.
  lien?: string;
  role?: string;
};

export type Photo = { src: string; alt: string; largeur: number; hauteur: number };

export type Edition = {
  annee: number;
  // Le rang dans le registre, sur deux chiffres (« 03 »).
  numero: string;
  theme: string;
  // « en » quand le thème est en anglais.
  langue?: string;
  description: string;
  // La date telle qu'on l'affiche, et sa forme ISO quand elle est connue.
  date: string;
  dateIso?: string;
  lieu: string;
  talks: string;
  lead: ReactNode;
  // L'affiche de l'édition ; les deux premières n'en ont pas, un visuel la
  // remplace, avec son propre texte alternatif et sa propre légende.
  affiche: { src: string; largeur: number; hauteur: number; alt?: string; legende?: string };
  // Le titre du récit, « Ce que consignent les archives » par défaut.
  titreFiche?: string;
  recit: ReactNode[];
  faits: { fort: ReactNode; detail: ReactNode }[];
  // Dans l'ordre de la scène ; le rôle s'affiche sous le nom.
  speakers: { slug: string; role?: string }[];
  equipe?: { lead: ReactNode; membres: Membre[] };
  galerie?: { photos: Photo[]; credit: ReactNode };
};

export const EDITIONS: Edition[] = [
  {
    annee: 2016,
    numero: "01",
    theme: "Shape the future",
    langue: "en",
    description: "TEDxUTTroyes 2016, première édition : le thème « Shape the future », sept speakers et les talks en vidéo.",
    date: "Mercredi 23 novembre 2016",
    dateIso: "2016-11-23",
    lieu: "Université de Technologie de Troyes",
    talks: "7 talks",
    lead: "La première ligne du registre. En 2016, une poignée d'étudiants de l'UTT obtient la licence TEDx et installe une scène rouge à Troyes : sept speakers, un thème tourné vers le futur, et une habitude prise.",
    affiche: { src: "/assets/img/editions/2016/visuel.webp", largeur: 840, hauteur: 840, alt: "La scène de la première édition : le thème Shape the future projeté au-dessus des lettres TEDxUTTroyes", legende: "Document : la scène de la première édition, le 23 novembre 2016" },
    titreFiche: "Le thème",
    recit: [
      "Axée sur l'action et l'impact de nos choix actuels, cette édition se penche sur la manière dont nous modelons activement le monde de demain. À travers des sujets comme l'intelligence artificielle, les technologies portables (wearables), le développement durable ou l'entrepreneuriat social, les talks mettent en lumière les innovations, les ruptures technologiques et les changements de mentalité nécessaires pour sculpter un avenir plus juste, connecté et responsable.",
      "Première ligne du registre, le mercredi 23 novembre 2016 : c'est elle qui a ouvert la voie aux éditions suivantes.",
    ],
    faits: [
      { fort: "23 novembre 2016", detail: "édition n° 1 sur 10" },
      { fort: "Université de Technologie de Troyes", detail: "le lieu de cette édition" },
      { fort: "7 talks", detail: "publiés sur la chaîne TEDx Talks" },
    ],
    speakers: [
      { slug: "gilles-mautin" },
      { slug: "boris-guiffot" },
      { slug: "davy-rey" },
      { slug: "darja-dubravcic" },
      { slug: "pierre-collet" },
      { slug: "karim-oumnia" },
      { slug: "adnan-maalaoui" },
    ],
  },
  {
    annee: 2017,
    numero: "02",
    theme: "To the Limits and Beyond",
    langue: "en",
    description: "TEDxUTTroyes 2017, deuxième édition : le thème « To the Limits and Beyond », sept speakers et les talks en vidéo.",
    date: "2017",
    lieu: "Université de Technologie de Troyes",
    talks: "7 talks",
    lead: <>Dès la deuxième édition, la question de la limite était posée : « To the Limits and Beyond ». Dix ans plus tard, la dixième édition reprend l'idée mais demande cette fois s'il faut <Masque texte="franchir ou s'adapter" />.</>,
    affiche: { src: "/assets/img/editions/2017/visuel.webp", largeur: 840, hauteur: 840, alt: "Visuel d'archive de l'édition 2017", legende: "Document : le visuel d'archive de l'édition 2017" },
    titreFiche: "Le thème",
    recit: [
      "Cette édition explore les frontières de la connaissance, de la technologie et du potentiel humain. Qu'il s'agisse de repousser les limites physiques de l'univers, de redéfinir les barrières technologiques avec le quantique, ou de questionner les limites cognitives de notre propre cerveau, les intervenants nous invitent à regarder au-delà de ce que nous tenons pour acquis pour imaginer un avenir aux possibilités infinies.",
    ],
    faits: [
      { fort: "29 novembre 2017", detail: "édition n° 2 sur 10" },
      { fort: "Université de Technologie de Troyes", detail: "le lieu de cette édition" },
      { fort: "7 talks", detail: "publiés sur la chaîne TEDx Talks" },
    ],
    speakers: [
      { slug: "nathalie-besson" },
      { slug: "christophe-couteau" },
      { slug: "hanine-mhannd" },
      { slug: "come-courteault" },
      { slug: "jamy-gourmaud" },
      { slug: "sophie-lavault" },
      { slug: "philippe-willekens" },
    ],
  },
  {
    annee: 2019,
    numero: "03",
    theme: "Thinking outside the box",
    langue: "en",
    description: "TEDxUTTroyes 2019, « Thinking outside the box » : les speakers, l'équipe et l'affiche de l'édition du 3 avril 2019 à l'UTT.",
    date: "3 avril 2019",
    dateIso: "2019-04-03",
    lieu: "Université de Technologie de Troyes",
    talks: "7 talks",
    lead: "Penser différemment, ouvrir le champ des possibles et les esprits : tels étaient les objectifs du TEDxUTTroyes 2019 à travers le thème « Thinking outside the box ».",
    affiche: { src: "/assets/img/editions/2019/affiche.webp", largeur: 595, hauteur: 842 },
    recit: [
      "Le 3 avril 2019, l'Université de Technologie de Troyes a accueilli l'édition annuelle de TEDxUTTroyes. Sept talks pour sortir du cadre, portés par huit intervenantes et intervenants venus d'horizons très différents.",
    ],
    faits: [
      { fort: "3 avril 2019", detail: "édition n° 3 sur 10" },
      { fort: "Université de Technologie de Troyes", detail: "le lieu de cette édition" },
      { fort: "7 talks", detail: "publiés sur la chaîne TEDx Talks" },
    ],
    speakers: [
      { slug: "alexandre-dana" },
      { slug: "cyrielle-hariel" },
      { slug: "mahamadou-faty" },
      { slug: "frederic-petitjean" },
      { slug: "thomas-saquet-florent-poinsaut" },
      { slug: "nathalie-lefevre" },
      { slug: "olivier-babeau" },
    ],
    equipe: {
      lead: "Des étudiantes et étudiants de l'UTT, réunis au sein de l'association Genius UTT, ont porté cette édition de bout en bout.",
      membres: [
        { nom: "Mathieu Diaz", portrait: "/assets/img/editions/2019/equipe/mathieu-diaz.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/diazmathieu", role: "Responsable de projet" },
        { nom: "Mélanie Selvame", portrait: "/assets/img/editions/2019/equipe/melanie-selvame.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/melanieslv", role: "Responsable de projet" },
      ],
    },
  },
  {
    annee: 2021,
    numero: "04",
    theme: "Changing codes",
    langue: "en",
    description: "TEDxUTTroyes 2021, « Changing codes » : l'édition diffusée en ligne le 5 mai 2021, ses sept speakers et son équipe.",
    date: "5 mai 2021",
    dateIso: "2021-05-05",
    lieu: "En ligne, sur YouTube",
    talks: "7 talks",
    lead: "Le thème « Changing codes » du TEDxUTTroyes 2021 a permis de présenter des innovations qui ont changé, changent et changeront nos habitudes à tous.",
    affiche: { src: "/assets/img/editions/2021/affiche.webp", largeur: 840, hauteur: 840, legende: "Document : le visuel de l'édition 2021, diffusée en ligne" },
    recit: [
      "Édition singulière du registre : crise sanitaire oblige, la conférence a eu lieu le 5 mai 2021 en ligne, sur YouTube. La scène était un écran, les codes avaient déjà changé.",
    ],
    faits: [
      { fort: "5 mai 2021", detail: "édition n° 4 sur 10" },
      { fort: "En ligne, sur YouTube", detail: "le lieu de cette édition" },
      { fort: "7 talks", detail: "publiés sur la chaîne TEDx Talks" },
    ],
    speakers: [
      { slug: "jacques-attali" },
      { slug: "geraldine-naja" },
      { slug: "yogan-le-fouler-barthel" },
      { slug: "frank-schneider" },
      { slug: "fatima-ait-bouana" },
      { slug: "patrick-constant" },
      { slug: "myriam-lewkowicz" },
    ],
    equipe: {
      lead: "Des étudiantes et étudiants de l'UTT, réunis au sein de l'association Genius UTT, ont porté cette édition de bout en bout.",
      membres: [
        { nom: "Oscar Benoit", portrait: "/assets/img/editions/2021/equipe/oscar-benoit.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/oscar-benoit-b479ba170/", role: "Responsable de projet" },
        { nom: "Paul Julien", portrait: "/assets/img/editions/2021/equipe/paul-julien.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/pauljulien0", role: "Coordinateur d'équipe" },
        { nom: "Baptiste Guichard", portrait: "/assets/img/editions/2021/equipe/baptiste-guichard.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/baptiste-guichard-1120b5183/", role: "Responsable communication" },
        { nom: "Augustin Ruttinger", portrait: "/assets/img/editions/2021/equipe/augustin-ruttinger.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/augustin-ruttinger/", role: "Responsable digital" },
        { nom: "Hugo Dutal", portrait: "/assets/img/editions/2021/equipe/hugo-dutal.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/hugo-dutal-16a468198/", role: "Responsable partenariats" },
        { nom: "Alex Dominguez", portrait: "/assets/img/editions/2021/equipe/alex-dominguez.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/alexdominguez-fr/", role: "Pôle logistique" },
        { nom: "Achille Perre", portrait: "/assets/img/editions/2021/equipe/achille-perre.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/achille-perre-2b90a720a/", role: "Pôle communication" },
        { nom: "Valentin Cam", portrait: "/assets/img/editions/2021/equipe/valentin-cam.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/valentin-cam-2449601a5/", role: "Pôle logistique" },
        { nom: "Axel Perrollaz", portrait: "/assets/img/editions/2021/equipe/axel-perrollaz.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/axel-perrollaz-3635561a7/", role: "Pôle logistique et communication" },
        { nom: "Pierre Ange Leundeu Mouaha", portrait: "/assets/img/editions/2021/equipe/pierre-ange-leundeu-mouaha.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/pierre-ange-leundeu-mouaha/", role: "Membre actif" },
      ],
    },
  },
  {
    annee: 2022,
    numero: "05",
    theme: "Circulation",
    description: "TEDxUTTroyes 2022, « Circulation » : les speakers, l'équipe et l'affiche de l'édition du 3 mars 2022 à l'UTT.",
    date: "3 mars 2022",
    dateIso: "2022-03-03",
    lieu: "Université de Technologie de Troyes",
    talks: "7 talks",
    lead: "Une soirée pour débattre et explorer des perspectives sur les enjeux contemporains : la santé, l'environnement, et la recherche de sa propre voie dans un monde en constante évolution.",
    affiche: { src: "/assets/img/editions/2022/affiche.webp", largeur: 840, hauteur: 1188 },
    recit: [
      "Le 3 mars 2022, l'Université de Technologie de Troyes a accueilli l'édition annuelle de TEDxUTTroyes autour du thème « Circulation » : circulation des idées, des corps, des flux.",
    ],
    faits: [
      { fort: "3 mars 2022", detail: "édition n° 5 sur 10" },
      { fort: "Université de Technologie de Troyes", detail: "le lieu de cette édition" },
      { fort: "7 talks", detail: "publiés sur la chaîne TEDx Talks" },
    ],
    speakers: [
      { slug: "frederic-saldmann" },
      { slug: "alexandra-ridoux" },
      { slug: "nathanael-ramos" },
      { slug: "marc-pic" },
      { slug: "bruno-jarrosson" },
      { slug: "elias-khoury" },
      { slug: "serge-zaka" },
    ],
    equipe: {
      lead: "Des étudiantes et étudiants de l'UTT, réunis au sein de l'association Genius UTT, ont porté cette édition de bout en bout.",
      membres: [
        { nom: "Achille Perre", portrait: "/assets/img/editions/2022/equipe/achille-perre.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/achille-perre-2b90a720a/", role: "Responsable de projet" },
        { nom: "Emerine Marquier", portrait: "/assets/img/editions/2022/equipe/emerine-marquier.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/emerine-marquier-00a896228", role: "Responsable speaker" },
        { nom: "Jeanne Chauvel", portrait: "/assets/img/editions/2022/equipe/jeanne-chauvel.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/jeanne-chauvel-94552b227", role: "Pôle speaker" },
        { nom: "Charlotte Legraet", portrait: "/assets/img/editions/2022/equipe/charlotte-legraet.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/charlotte-le-graet-35a258222", role: "Pôle communication" },
        { nom: "Clémence", portrait: "/assets/img/editions/2022/equipe/clemence-photo-generique.webp", largeur: 480, hauteur: 480, role: "Pôle communication" },
        { nom: "Odelia Olender", portrait: "/assets/img/editions/2022/equipe/odelia-olender.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/odelia-olender", role: "Membre active" },
        { nom: "Christina Pham", portrait: "/assets/img/editions/2022/equipe/christina-pham.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/pham-christina", role: "Membre active" },
        { nom: "Louise Ecale", portrait: "/assets/img/editions/2022/equipe/louise-ecale.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/louise-ecale-625a7b188", role: "Membre active" },
        { nom: "Marius Caisson", portrait: "/assets/img/editions/2022/equipe/marius-caisson.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/marius-caisson-0142ab1b8", role: "Membre actif" },
        { nom: "Vincent Lemaître", portrait: "/assets/img/editions/2022/equipe/vincent-lemaitre.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/vincent-lema%C3%AEtre-8620921a6", role: "Membre actif" },
      ],
    },
  },
  {
    annee: 2023,
    numero: "06",
    theme: "Impacting our world",
    langue: "en",
    description: "TEDxUTTroyes 2023, « Impacting our world » : les speakers, l'équipe et le retour en images de l'édition du 15 mars 2023 à l'UTT.",
    date: "15 mars 2023",
    dateIso: "2023-03-15",
    lieu: "Université de Technologie de Troyes",
    talks: "6 talks",
    lead: "Le thème « Impacting our world » a permis d'évoquer les grands enjeux de notre siècle : la réponse au changement climatique, ou les répercussions du développement de l'intelligence artificielle sur l'humanité.",
    affiche: { src: "/assets/img/editions/2023/affiche.webp", largeur: 840, hauteur: 1188 },
    recit: [
      "Cette édition a eu lieu le 15 mars 2023 à l'Université de Technologie de Troyes : six talks pour mesurer l'empreinte que chacun laisse sur le monde, et ce que le monde nous renvoie.",
    ],
    faits: [
      { fort: "15 mars 2023", detail: "édition n° 6 sur 10" },
      { fort: "Université de Technologie de Troyes", detail: "le lieu de cette édition" },
      { fort: "6 talks", detail: "publiés sur la chaîne TEDx Talks" },
    ],
    speakers: [
      { slug: "vincent-doumeizel" },
      { slug: "theo-hoenen" },
      { slug: "serge-rohmer" },
      { slug: "marcel-soh" },
      { slug: "karim-hechmi" },
      { slug: "leo-techmaker" },
    ],
    equipe: {
      lead: "Des étudiantes et étudiants de l'UTT, réunis au sein de l'association Genius UTT, ont porté cette édition de bout en bout.",
      membres: [
        { nom: "Solène Derniaux", portrait: "/assets/img/editions/2023/equipe/solene-derniaux.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/solenederniaux", role: "Responsable de projet" },
        { nom: "Achille Perre", portrait: "/assets/img/editions/2023/equipe/achille-perre.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/achille-perre", role: "Président Genius UTT" },
        { nom: "Hugo Pinard", portrait: "/assets/img/editions/2023/equipe/hugo-pinard.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/hugo-pinard", role: "Vice-président Genius UTT" },
        { nom: "Briac Mevel-Dutertre", portrait: "/assets/img/editions/2023/equipe/briac-mevel-dutertre.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/briac-mevel-dutertre-b8287324a", role: "Responsable communication" },
        { nom: "Rayan Djebari", portrait: "/assets/img/editions/2023/equipe/rayan-djebari.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/rayan-djebari-079a26224", role: "Pôle speaker" },
        { nom: "Sibylle Fedacou", portrait: "/assets/img/editions/2023/equipe/sibylle-fedacou.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/sibylle-fedacou", role: "Pôle speaker" },
        { nom: "Ludovic Marquès", portrait: "/assets/img/editions/2023/equipe/ludovic-marques.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/ludovicmarques", role: "Responsable partenariats et webmaster" },
        { nom: "Constance Benoist-Gironnière", portrait: "/assets/img/editions/2023/equipe/constance-benoist-gironniere.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/constance-benoist-gironi%C3%A8re-98493825a", role: "Pôle logistique" },
        { nom: "Paul Contant", portrait: "/assets/img/editions/2023/equipe/paul-contant.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/paul-contant-196b55278", role: "Pôle logistique" },
      ],
    },
    galerie: {
      photos: [
        { src: "/assets/img/editions/2023/galerie/01.webp", alt: "Vincent Doumeizel sur la scène du TEDxUTTroyes 2023", largeur: 1400, hauteur: 933 },
        { src: "/assets/img/editions/2023/galerie/02.webp", alt: "Marcel Soh sur la scène du TEDxUTTroyes 2023", largeur: 1400, hauteur: 933 },
        { src: "/assets/img/editions/2023/galerie/03.webp", alt: "Photo de groupe des speakers et de l'équipe 2023", largeur: 1400, hauteur: 933 },
        { src: "/assets/img/editions/2023/galerie/04.webp", alt: "Le public de l'édition 2023", largeur: 1400, hauteur: 933 },
        { src: "/assets/img/editions/2023/galerie/05.webp", alt: "Un moment de l'édition 2023", largeur: 1400, hauteur: 933 },
        { src: "/assets/img/editions/2023/galerie/06.webp", alt: "Un moment de l'édition 2023", largeur: 1400, hauteur: 933 },
        { src: "/assets/img/editions/2023/galerie/07.webp", alt: "Karim Hechmi sur la scène du TEDxUTTroyes 2023", largeur: 1400, hauteur: 933 },
        { src: "/assets/img/editions/2023/galerie/08.webp", alt: "Un moment de l'édition 2023", largeur: 1400, hauteur: 2100 },
        { src: "/assets/img/editions/2023/galerie/09.webp", alt: "L'équipe organisatrice de l'édition 2023", largeur: 1400, hauteur: 933 },
        { src: "/assets/img/editions/2023/galerie/10.webp", alt: "Un moment de l'édition 2023", largeur: 1400, hauteur: 933 },
      ],
      credit: "Photographies : ©argentique utt",
    },
  },
  {
    annee: 2024,
    numero: "07",
    theme: "Le monde de demain",
    description: "TEDxUTTroyes 2024, « Le monde de demain » : les speakers, l'équipe et le retour en images de l'édition du 22 mars 2024 au Centre de Congrès de l'Aube.",
    date: "22 mars 2024",
    dateIso: "2024-03-22",
    lieu: "Centre de Congrès de l'Aube, Troyes",
    talks: "7 talks",
    lead: "Le 22 mars 2024, le Centre de Congrès a accueilli une soirée consacrée au « monde de demain » : une série de conférences explorant les innovations, les idées et les visions qui façonneront notre futur.",
    affiche: { src: "/assets/img/editions/2024/affiche.webp", largeur: 840, hauteur: 1188 },
    recit: [
      "Penseurs, innovateurs et leaders de divers horizons ont partagé leurs réflexions et leurs idées, offrant au public un moment riche en découvertes, en émotions et en inspiration. Une édition marquante, tournée vers l'avenir et les enjeux de demain. C'était aussi la première fois que TEDxUTTroyes quittait les amphithéâtres de l'UTT pour la grande salle du Centre de Congrès.",
    ],
    faits: [
      { fort: "22 mars 2024", detail: "édition n° 7 sur 10" },
      { fort: "Centre de Congrès de l'Aube, Troyes", detail: "le lieu de cette édition" },
      { fort: "7 talks", detail: "publiés sur la chaîne TEDx Talks" },
    ],
    speakers: [
      { slug: "claire-petreault" },
      { slug: "lise-molimard" },
      { slug: "yogan-le-fouler-barthel" },
      { slug: "lydie-lescarmontier" },
      { slug: "emmanuel-carquin" },
      { slug: "damien-berry" },
      { slug: "lilie-boizumault" },
    ],
    equipe: {
      lead: "Des étudiantes et étudiants de l'UTT, réunis au sein de l'association Genius UTT, ont porté cette édition de bout en bout.",
      membres: [
        { nom: "Paul Contant", portrait: "/assets/img/editions/2024/equipe/paul-contant.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/paul-contant-196b55278", role: "Responsable de projet" },
        { nom: "Solène Derniaux", portrait: "/assets/img/editions/2024/equipe/solene-derniaux.webp", largeur: 480, hauteur: 480, role: "Présidente Genius UTT" },
        { nom: "Alban Delahais", portrait: "/assets/img/editions/2024/equipe/alban-delahais.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/alban-delahais-0b4518234", role: "Responsable pôle speaker" },
        { nom: "Camille le Roch", portrait: "/assets/img/editions/2024/equipe/camille-le-roch.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/camille-le-roch-a2b9a3215", role: "Responsable communication" },
        { nom: "Justine Combemorel", portrait: "/assets/img/editions/2024/equipe/justine-combemorel.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/justine-combemorel-a04a70226", role: "Responsable partenariat et pôle speaker" },
        { nom: "Yandy-Alexandre Miemounitou", portrait: "/assets/img/editions/2024/equipe/yandy-alexandre-miemounitou.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/yandy-alexandre-miemounitou", role: "Pôle speaker" },
        { nom: "Pénélope de Lambert des Champs de Morel", portrait: "/assets/img/editions/2024/equipe/penelope-de-lambert-des-champs-de-morel.webp", largeur: 480, hauteur: 480, role: "Pôle speaker" },
      ],
    },
    galerie: {
      photos: [
        { src: "/assets/img/editions/2024/galerie/01.webp", alt: "La scène du TEDxUTTroyes 2024", largeur: 1400, hauteur: 933 },
        { src: "/assets/img/editions/2024/galerie/02.webp", alt: "Un moment de l'édition 2024", largeur: 1400, hauteur: 2100 },
        { src: "/assets/img/editions/2024/galerie/03.webp", alt: "Un moment de l'édition 2024", largeur: 1400, hauteur: 933 },
        { src: "/assets/img/editions/2024/galerie/04.webp", alt: "Un moment de l'édition 2024", largeur: 1400, hauteur: 933 },
        { src: "/assets/img/editions/2024/galerie/05.webp", alt: "Un moment de l'édition 2024", largeur: 1400, hauteur: 933 },
        { src: "/assets/img/editions/2024/galerie/06.webp", alt: "Un moment de l'édition 2024", largeur: 1400, hauteur: 933 },
        { src: "/assets/img/editions/2024/galerie/07.webp", alt: "Un moment de l'édition 2024", largeur: 1400, hauteur: 933 },
        { src: "/assets/img/editions/2024/galerie/08.webp", alt: "Un moment de l'édition 2024", largeur: 1400, hauteur: 933 },
        { src: "/assets/img/editions/2024/galerie/09.webp", alt: "Un moment de l'édition 2024", largeur: 1400, hauteur: 933 },
        { src: "/assets/img/editions/2024/galerie/10.webp", alt: "Un moment de l'édition 2024", largeur: 1400, hauteur: 933 },
      ],
      credit: "Photographies : ©argentique utt",
    },
  },
  {
    annee: 2025,
    numero: "08",
    theme: "Réveiller l'avenir",
    description: "TEDxUTTroyes 2025, « Réveiller l'avenir » : les speakers, l'équipe et l'affiche de l'édition du 21 mars 2025 au Centre de Congrès de l'Aube.",
    date: "21 mars 2025",
    dateIso: "2025-03-21",
    lieu: "Centre de Congrès de l'Aube, Troyes",
    talks: "7 talks",
    lead: "Le 21 mars 2025, le Centre de Congrès de l'Aube a accueilli une édition placée sous le thème « Réveiller l'avenir » : conférences, idées et visions se sont succédé pour explorer les innovations et les grands enjeux de demain.",
    affiche: { src: "/assets/img/editions/2025/affiche.webp", largeur: 840, hauteur: 1188 },
    recit: [
      "Penseurs, innovateurs et leaders de différents horizons ont partagé leurs perspectives, offrant au public un moment riche en échanges, en émotions et en inspiration. Cette édition 2025 restera un temps fort, marqué par l'énergie des intervenants et l'enthousiasme du public.",
    ],
    faits: [
      { fort: "21 mars 2025", detail: "édition n° 8 sur 10" },
      { fort: "Centre de Congrès de l'Aube, Troyes", detail: "le lieu de cette édition" },
      { fort: "7 talks", detail: "publiés sur la chaîne TEDx Talks" },
    ],
    speakers: [
      { slug: "timaho" },
      { slug: "jean-audouze" },
      { slug: "eugenie-merieau" },
      { slug: "mathieu-boucher" },
      { slug: "sidonie-martinez-svoboda" },
      { slug: "gregory-romano" },
      { slug: "ivan-kovac" },
    ],
    equipe: {
      lead: "Des étudiantes et étudiants de l'UTT, réunis au sein de l'association Genius UTT, ont porté cette édition de bout en bout.",
      membres: [
        { nom: "Yandy-Alexandre Miemounitou", portrait: "/assets/img/editions/2025/equipe/yandy-alexandre-miemounitou.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/yandy-alexandre-miemounitou", role: "Responsable de projet" },
        { nom: "Camille le Roch", portrait: "/assets/img/editions/2025/equipe/camille-le-roch.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/camille-le-roch-a2b9a3215", role: "Responsable de projet" },
        { nom: "Chloé Aubry", portrait: "/assets/img/editions/2025/equipe/chloe-aubry.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/chlo%C3%A9-aubry/", role: "Présidente Genius UTT" },
        { nom: "Pierre Dessauw", portrait: "/assets/img/editions/2025/equipe/pierre-dessauw.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/pierre-dessauw-267748258/", role: "Vice-président Genius UTT" },
        { nom: "Nathan Ramecourt", portrait: "/assets/img/editions/2025/equipe/nathan-ramecourt.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/nathan-ramecourt-44b196330/", role: "Trésorier Genius UTT" },
        { nom: "Sila Capar", portrait: "/assets/img/editions/2025/equipe/sila-capar.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/silacapar/", role: "Responsable communication" },
        { nom: "Solène Bernard", portrait: "/assets/img/editions/2025/equipe/solene-bernard.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/sol%C3%A8ne-bernard-922471303/", role: "Pôle speaker" },
        { nom: "Solène Derniaux", portrait: "/assets/img/editions/2025/equipe/solene-derniaux.webp", largeur: 480, hauteur: 480, role: "Pôle speaker et webmaster" },
      ],
    },
  },
  {
    annee: 2026,
    numero: "09",
    theme: "Un futur à bâtir",
    description: "TEDxUTTroyes 2026, « Un futur à bâtir » : les six speakers, l'équipe et l'affiche de la neuvième édition.",
    date: "Vendredi 20 mars 2026",
    lieu: "Centre de Congrès de l'Aube, Troyes",
    talks: "5 talks",
    lead: <>Neuvième ligne du registre : « Un futur à bâtir ». Cinq talks pour poser des fondations, un an avant que la dixième édition ne vienne interroger <Masque texte="la limite" />.</>,
    affiche: { src: "/assets/img/editions/2026/affiche.webp", largeur: 840, hauteur: 1233 },
    recit: [
      "Un explorateur polaire, une chercheuse en mécanique et nanotechnologies, un ancien chef de groupe du GIGN de Cayenne, un entrepreneur et un bâtisseur d'idées : cinq façons de construire ce qui n'existe pas encore.",
    ],
    faits: [
      { fort: "Vendredi 20 mars 2026", detail: "édition n° 9 sur 10" },
      { fort: "Centre de Congrès de l'Aube, Troyes", detail: "le lieu de cette édition" },
      { fort: "5 talks", detail: "donnés ce soir-là, quatre publiés sur la chaîne TEDx Talks" },
    ],
    speakers: [
      { slug: "alban-michon", role: "Explorateur polaire" },
      { slug: "daniella-tchana", role: "Mécanique et nanotechnologies" },
      { slug: "franck-robin", role: "Ancien chef de groupe AGIGN, Cayenne" },
      { slug: "jean-marie-simon", role: "Gouvernance et top management, intervention annulée" },
      { slug: "jean-michel-adelaide", role: "TORYO et Fondation UTT" },
      { slug: "nicolas-dehandschoewercker", role: "Entrepreneur" },
    ],
    equipe: {
      lead: "Des étudiantes et étudiants de l'UTT, réunis au sein de l'association Genius UTT, ont porté cette édition de bout en bout.",
      membres: [
        { nom: "Baptiste Hustaix", portrait: "/assets/img/editions/2026/equipe/baptiste-hustaix.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/baptiste-hustaix/", role: "Responsable speakers" },
        { nom: "Charles Puygranier", portrait: "/assets/img/editions/2026/equipe/charles-puygranier.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/charles-puygranier/", role: "Logistique et speakers" },
        { nom: "Damaris Barbot", portrait: "/assets/img/editions/2026/equipe/damaris.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/damaris-barbot-utt/", role: "Responsable logistique" },
        { nom: "Jeanne Jugie", portrait: "/assets/img/editions/2026/equipe/jeanne-jugie.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/jeanne-jugie-b14211338/", role: "Responsable partenariat" },
        { nom: "Julie Noël", portrait: "/assets/img/editions/2026/equipe/julie-noel.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/julie-no%C3%ABl-438559367/", role: "Responsable communication" },
        { nom: "Nathan Ramecourt", portrait: "/assets/img/editions/2026/equipe/nathan-ramecourt.webp", largeur: 480, hauteur: 480, lien: "https://www.linkedin.com/in/nathan-ramecourt/", role: "Président de Genius UTT" },
      ],
    },
  },
];
