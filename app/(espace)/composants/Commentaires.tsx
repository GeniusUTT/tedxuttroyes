import { commentaires } from '@/lib/suivi';
import { peutCommenter, type Contexte, type RefDocument } from '@/lib/droits';
import { actionCommenter, actionSupprimerCommentaire } from '../espace/documents/suivi-actions';
import { Bouton } from './Bouton';
import { quand } from './Documents';

// Le fil des retours d'un document : speaker et équipe, dans l'ordre.
export async function Commentaires({ documentId, ctx, doc }: { documentId: string; ctx: Contexte & { editionId: string }; doc: RefDocument }) {
  const fil = await commentaires(ctx, documentId);
  return (
    <>
      {fil.length === 0 ? <p className="muet">Aucun retour pour l’instant.</p> : (
        <ul className="fil">
          {fil.map(({ c, nom, role }) => (
            <li key={c.id} className={role !== 'speaker' ? 'equipe' : undefined}>
              <p className="muet">{nom ?? 'Compte supprimé'}{role !== 'speaker' ? ' · équipe' : ''} · {quand(c.createdAt)}</p>
              <p style={{ whiteSpace: 'pre-line' }}>{c.texte}</p>
              {(c.auteurId === ctx.id || ctx.role === 'admin') && (
                <form action={actionSupprimerCommentaire.bind(null, c.id, documentId)}><Bouton variante="sobre" petit>Supprimer</Bouton></form>
              )}
            </li>
          ))}
        </ul>
      )}
      {peutCommenter(ctx, doc) && (
        <form action={actionCommenter.bind(null, documentId)}>
          <div className="champ"><label htmlFor="texte">Votre retour</label><textarea id="texte" name="texte" required maxLength={5000} /></div>
          <Bouton>Publier le retour</Bouton>
        </form>
      )}
    </>
  );
}
