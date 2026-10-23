import tables from './schema.js';
import donnees from './donnees.js';
import niveaux from './niveaux.js';

export default {
  id: 'systeme_solaire',
  nom: 'Système solaire',
  icone: '🪐',
  description: 'Les planètes, leurs lunes et les sondes qui les ont explorées.',
  tables,
  donnees,
  niveaux,
  exemples: [
    { label: 'Toutes les planètes', sql: 'SELECT * FROM planetes;' },
    {
      label: 'Lunes par planète',
      sql: `SELECT p.nom AS planete, l.nom AS lune, l.diametre_km
FROM lunes l
JOIN planetes p ON p.id = l.planete_id
ORDER BY p.id, l.diametre_km DESC;`,
    },
    {
      label: 'Missions et cibles',
      sql: `SELECT m.nom, m.agence, m.date_lancement, p.nom AS planete, v.mode
FROM missions m
JOIN visites v ON v.mission_id = m.id
JOIN planetes p ON p.id = v.planete_id
ORDER BY m.date_lancement;`,
    },
  ],
};
