import tables from './schema.js';
import donnees from './donnees.js';
import niveaux from './niveaux.js';

export default {
  id: 'boulangerie',
  nom: 'Boulangerie',
  icone: '🥐',
  description: 'Une boulangerie de quartier : produits, clients, équipe et commandes du premier trimestre 2025.',
  tables,
  donnees,
  niveaux,
  exemples: [
    { label: 'Tous les produits', sql: 'SELECT * FROM produits;' },
    {
      label: 'Détail des commandes',
      sql: `SELECT co.id, co.date_commande, c.prenom, p.nom, l.quantite, p.prix * l.quantite AS montant
FROM commandes co
JOIN clients c ON c.id = co.client_id
JOIN lignes l ON l.commande_id = co.id
JOIN produits p ON p.id = l.produit_id
ORDER BY co.id;`,
    },
    {
      label: 'Organigramme',
      sql: `SELECT e.prenom, e.poste, r.prenom AS responsable
FROM employes e
LEFT JOIN employes r ON r.id = e.responsable_id;`,
    },
  ],
};
