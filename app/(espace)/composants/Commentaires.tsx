import { commentaires } from '@/lib/suivi';
import { peutCommenter, type Contexte, type RefDocument } from '@/lib/droits';
import { actionCommenter, actionSupprimerCommentaire } from '../espace/documents/suivi-actions';
import { Bouton } from './Bouton';
import { quand } from './Documents';

// Le fil des retours d'un document : speaker et équipe, dans l'ordre. Les
// retours de l'équipe portent le filet rouge.
export async function Commentaires({ documentId, ctx, doc }: { documentId: string; ctx: Contexte & { editionId: string }; doc: RefDocument }) {
  const fil = await commentaires(ctx, documentId);
  return (
    <>
      {fil.length === 0 ? <p className="muet">Aucun retour pour l’instant.</p> : (
        <ul className="fil">
          {fil.map(({ c, nom, role }) => (
            <li key={c.id} className={role === 'membre' ? 'equipe' : undefined}>
              <p className="muet">{nom ?? 'Compte supprimé'}{role === 'membre' ? ' · équipe' : ''} · {quand(c.createdAt)}</p>
              <p className="texte-libre">{c.texte}</p>
              {(c.auteurId === ctx.id || ctx.role === 'membre') && (
                <form action={actionSupprimerCommentaire.bind(null, c.id, documentId)}><Bouton variante="sobre" petit>Supprimer</Bouton></form>
              )}
            </li>
          ))}
        </ul>
      )}
      {peutCommenter(ctx, doc) && (
        <form action={actionCommenter.bind(null, documentId)} className="formulaire">
          <div className="champ"><label htmlFor="texte">Votre retour</label><textarea id="texte" name="texte" required maxLength={5000} /></div>
          <Bouton>Publier le retour</Bouton>
        </form>
      )}
    </>
  );
}
