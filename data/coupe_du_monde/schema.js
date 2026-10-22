// Définition neutre des tables : seed.js la traduit en DDL MySQL et PostgreSQL,
// et la sidebar l'utilise pour afficher les colonnes.
export default [
  {
    nom: 'pays',
    description: 'Les pays (sélections nationales). L’Allemagne de l’Ouest est comptée comme Allemagne.',
    colonnes: [
      { nom: 'id', type: 'INT', pk: true },
      { nom: 'nom', type: 'VARCHAR(60)' },
      { nom: 'continent', type: 'VARCHAR(20)' },
      { nom: 'code', type: 'CHAR(3)' },
    ],
  },
  {
    nom: 'editions',
    description: 'Les 22 éditions de la Coupe du monde masculine (1930 – 2022).',
    colonnes: [
      { nom: 'annee', type: 'INT', pk: true },
      { nom: 'hote_id', type: 'INT', ref: 'pays' },
      { nom: 'co_hote_id', type: 'INT', ref: 'pays', nullable: true },
      { nom: 'vainqueur_id', type: 'INT', ref: 'pays' },
      { nom: 'finaliste_id', type: 'INT', ref: 'pays' },
      { nom: 'troisieme_id', type: 'INT', ref: 'pays' },
      { nom: 'score_finale', type: 'VARCHAR(30)' },
      { nom: 'nb_equipes', type: 'INT' },
      { nom: 'nb_buts', type: 'INT' },
    ],
  },
  {
    nom: 'joueurs',
    description: 'Des joueurs marquants de l’histoire de la compétition.',
    colonnes: [
      { nom: 'id', type: 'INT', pk: true },
      { nom: 'nom', type: 'VARCHAR(80)' },
      { nom: 'pays_id', type: 'INT', ref: 'pays' },
      { nom: 'poste', type: 'VARCHAR(20)' },
    ],
  },
  {
    nom: 'buteurs',
    description: 'Nombre de buts marqués par un joueur lors d’une édition.',
    colonnes: [
      { nom: 'joueur_id', type: 'INT', pk: true, ref: 'joueurs' },
      { nom: 'annee', type: 'INT', pk: true, ref: 'editions' },
      { nom: 'buts', type: 'INT' },
    ],
  },
];
