// Définition neutre des tables : seed.js la traduit en DDL MySQL et PostgreSQL,
// et la sidebar l'utilise pour afficher les colonnes.
export default [
  {
    nom: 'produits',
    description: 'Ce qui est vendu en boutique, avec son prix unitaire en euros.',
    colonnes: [
      { nom: 'id', type: 'INT', pk: true },
      { nom: 'nom', type: 'VARCHAR(40)' },
      { nom: 'categorie', type: 'VARCHAR(20)' },
      { nom: 'prix', type: 'DECIMAL(5,2)' },
    ],
  },
  {
    nom: 'clients',
    description: 'Les clients inscrits au programme de fidélité. L’email est facultatif.',
    colonnes: [
      { nom: 'id', type: 'INT', pk: true },
      { nom: 'prenom', type: 'VARCHAR(30)' },
      { nom: 'nom', type: 'VARCHAR(30)' },
      { nom: 'ville', type: 'VARCHAR(30)' },
      { nom: 'date_inscription', type: 'DATE' },
      { nom: 'email', type: 'VARCHAR(60)', nullable: true },
    ],
  },
  {
    nom: 'employes',
    description: 'L’équipe. responsable_id pointe vers un autre employé (vide pour la gérante).',
    colonnes: [
      { nom: 'id', type: 'INT', pk: true },
      { nom: 'prenom', type: 'VARCHAR(30)' },
      { nom: 'poste', type: 'VARCHAR(30)' },
      { nom: 'responsable_id', type: 'INT', ref: 'employes', nullable: true },
      { nom: 'date_embauche', type: 'DATE' },
    ],
  },
  {
    nom: 'commandes',
    description: 'Les commandes du premier trimestre 2025 : qui a acheté, qui a servi, et quand.',
    colonnes: [
      { nom: 'id', type: 'INT', pk: true },
      { nom: 'client_id', type: 'INT', ref: 'clients' },
      { nom: 'employe_id', type: 'INT', ref: 'employes' },
      { nom: 'date_commande', type: 'DATE' },
    ],
  },
  {
    nom: 'lignes',
    description: 'Le détail de chaque commande : un produit et sa quantité.',
    colonnes: [
      { nom: 'commande_id', type: 'INT', pk: true, ref: 'commandes' },
      { nom: 'produit_id', type: 'INT', pk: true, ref: 'produits' },
      { nom: 'quantite', type: 'INT' },
    ],
  },
];
