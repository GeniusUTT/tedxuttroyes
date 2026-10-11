import Link from 'next/link';
import { Cadre, Section } from './composants/Cadre';

export default function Introuvable() {
  return (
    <Cadre cote="404" titre="Page introuvable" chapo="Cette page n’existe pas, ou vous n’y avez pas accès.">
      <Section cote="Et maintenant">
        <p><Link className="btn btn--primary" href="/espace/">Revenir à l’espace</Link></p>
      </Section>
    </Cadre>
  );
}
