import tables from './schema.js';
import donnees from './donnees.js';
import niveaux from './niveaux.js';

export default {
  id: 'coupe_du_monde',
  nom: 'Coupe du monde',
  icone: '⚽',
  description: 'Toutes les éditions de la Coupe du monde de football masculine, de 1930 à 2022.',
  tables,
  donnees,
  niveaux,
  exemples: [
    { label: 'Tous les pays', sql: 'SELECT * FROM pays;' },
    {
      label: 'Finales',
      sql: `SELECT e.annee, v.nom AS vainqueur, f.nom AS finaliste, e.score_finale
FROM editions e
JOIN pays v ON v.id = e.vainqueur_id
JOIN pays f ON f.id = e.finaliste_id
ORDER BY e.annee DESC;`,
    },
    {
      label: 'Meilleurs buteurs',
      sql: `SELECT j.nom, SUM(b.buts) AS total
FROM buteurs b
JOIN joueurs j ON j.id = b.joueur_id
GROUP BY j.id, j.nom
ORDER BY total DESC
LIMIT 10;`,
    },
  ],
};
