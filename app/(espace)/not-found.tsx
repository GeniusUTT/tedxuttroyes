import { Cadre } from './composants/Cadre';

export default function Introuvable() {
  return (
    <Cadre etroit>
      <p className="cote">404</p>
      <h1>Page introuvable</h1>
      <p>Cette page n’existe pas, ou vous n’y avez pas accès.</p>
      <p><a href="/espace/">Revenir à l’espace</a></p>
    </Cadre>
  );
}
