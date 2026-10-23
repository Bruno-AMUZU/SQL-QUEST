import tables from './schema.js';
import donnees from './donnees.js';
import niveaux from './niveaux.js';

export default {
  id: 'mediatheque',
  nom: 'Médiathèque',
  icone: '📚',
  description: 'Des classiques et des contemporains, leurs auteurs, et les emprunts des adhérents.',
  tables,
  donnees,
  niveaux,
  exemples: [
    { label: 'Tous les livres', sql: 'SELECT * FROM livres;' },
    {
      label: 'Livres et auteurs',
      sql: `SELECT l.titre, a.nom AS auteur, l.annee_publication, l.genre
FROM livres l
JOIN auteurs a ON a.id = l.auteur_id
ORDER BY a.nom, l.annee_publication;`,
    },
    {
      label: 'Historique des emprunts',
      sql: `SELECT e.date_emprunt, e.date_retour, ad.prenom, l.titre
FROM emprunts e
JOIN adherents ad ON ad.id = e.adherent_id
JOIN livres l ON l.id = e.livre_id
ORDER BY e.date_emprunt DESC;`,
    },
  ],
};
