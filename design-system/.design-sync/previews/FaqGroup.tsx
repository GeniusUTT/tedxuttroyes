import { FaqGroup, FaqItem } from "@tedxuttroyes/design-system";

/** Un groupe de questions, sous son intitule. */
export function Groupe() {
  return (
    <FaqGroup title="Billetterie">
      <FaqItem question="Comment réserver ma place ?">
        <p>
          La billetterie est hébergée sur Billetweb : cliquez sur « Réserver ma place »
          depuis n'importe quelle page du site.
        </p>
      </FaqItem>
      <FaqItem question="Combien coûte un billet ?">
        <p>
          Les tarifs de la dixième édition seront annoncés à l'ouverture de la billetterie.
        </p>
      </FaqItem>
      <FaqItem question="Puis-je me faire rembourser ou céder mon billet ?">
        <p>
          Les conditions d'échange et de remboursement seront précisées sur la page
          Billetweb de la billetterie.
        </p>
      </FaqItem>
    </FaqGroup>
  );
}

/** La FAQ complete : plusieurs groupes a la suite. */
export function PlusieursGroupes() {
  return (
    <div>
      <FaqGroup title="Horaires">
        <FaqItem question="À quelle heure faut-il arriver ?">
          <p>
            Les portes ouvrent à 18h00, les talks commencent à 19h30 précises. Prévoyez
            d'être sur place au moins un quart d'heure avant.
          </p>
        </FaqItem>
      </FaqGroup>
      <FaqGroup title="Accès">
        <FaqItem question="Comment venir au Centre de Congrès de l'Aube ?">
          <p>
            Le Centre de Congrès de l'Aube se trouve au 2 rue Pierre Labonde, à Troyes.
            Comptez environ un quart d'heure à pied depuis la gare.
          </p>
        </FaqItem>
        <FaqItem question="L'accès est-il possible en fauteuil roulant ?">
          <p>Oui, la salle est accessible aux personnes à mobilité réduite.</p>
        </FaqItem>
      </FaqGroup>
    </div>
  );
}
