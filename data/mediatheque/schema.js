// Définition neutre des tables : seed.js la traduit en DDL MySQL et PostgreSQL,
// et la sidebar l'utilise pour afficher les colonnes.
export default [
  {
    nom: 'auteurs',
    description: 'Des autrices et auteurs du monde entier. annee_deces est vide pour les vivants.',
    colonnes: [
      { nom: 'id', type: 'INT', pk: true },
      { nom: 'nom', type: 'VARCHAR(40)' },
      { nom: 'nationalite', type: 'VARCHAR(20)' },
      { nom: 'annee_naissance', type: 'INT' },
      { nom: 'annee_deces', type: 'INT', nullable: true },
    ],
  },
  {
    nom: 'livres',
    description: 'Le fonds de la médiathèque, avec l’année de première publication.',
    colonnes: [
      { nom: 'id', type: 'INT', pk: true },
      { nom: 'titre', type: 'VARCHAR(60)' },
      { nom: 'auteur_id', type: 'INT', ref: 'auteurs' },
      { nom: 'annee_publication', type: 'INT' },
      { nom: 'genre', type: 'VARCHAR(20)' },
    ],
  },
  {
    nom: 'adherents',
    description: 'Les personnes inscrites à la médiathèque.',
    colonnes: [
      { nom: 'id', type: 'INT', pk: true },
      { nom: 'prenom', type: 'VARCHAR(30)' },
      { nom: 'nom', type: 'VARCHAR(30)' },
      { nom: 'date_adhesion', type: 'DATE' },
    ],
  },
  {
    nom: 'emprunts',
    description: 'Chaque prêt d’un livre. date_retour est vide tant que le livre n’est pas rendu.',
    colonnes: [
      { nom: 'id', type: 'INT', pk: true },
      { nom: 'livre_id', type: 'INT', ref: 'livres' },
      { nom: 'adherent_id', type: 'INT', ref: 'adherents' },
      { nom: 'date_emprunt', type: 'DATE' },
      { nom: 'date_retour', type: 'DATE', nullable: true },
    ],
  },
];
