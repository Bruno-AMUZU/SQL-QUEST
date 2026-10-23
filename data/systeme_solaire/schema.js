// Définition neutre des tables : seed.js la traduit en DDL MySQL et PostgreSQL,
// et la sidebar l'utilise pour afficher les colonnes.
export default [
  {
    nom: 'planetes',
    description: 'Les huit planètes du Système solaire (valeurs moyennes de la NASA).',
    colonnes: [
      { nom: 'id', type: 'INT', pk: true },
      { nom: 'nom', type: 'VARCHAR(20)' },
      { nom: 'categorie', type: 'VARCHAR(20)' },
      { nom: 'distance_soleil_mkm', type: 'DECIMAL(6,1)' },
      { nom: 'diametre_km', type: 'INT' },
      { nom: 'duree_annee_jours', type: 'DECIMAL(7,1)' },
      { nom: 'temperature_c', type: 'INT' },
      { nom: 'gravite', type: 'DECIMAL(4,1)' },
    ],
  },
  {
    nom: 'lunes',
    description: 'Une sélection de satellites naturels, avec leur découverte.',
    colonnes: [
      { nom: 'id', type: 'INT', pk: true },
      { nom: 'nom', type: 'VARCHAR(20)' },
      { nom: 'planete_id', type: 'INT', ref: 'planetes' },
      { nom: 'diametre_km', type: 'INT' },
      { nom: 'annee_decouverte', type: 'INT', nullable: true },
      { nom: 'decouvreur', type: 'VARCHAR(40)', nullable: true },
    ],
  },
  {
    nom: 'missions',
    description: 'Des sondes spatiales ayant exploré les planètes.',
    colonnes: [
      { nom: 'id', type: 'INT', pk: true },
      { nom: 'nom', type: 'VARCHAR(30)' },
      { nom: 'agence', type: 'VARCHAR(20)' },
      { nom: 'date_lancement', type: 'DATE' },
    ],
  },
  {
    nom: 'visites',
    description: 'Les planètes étudiées par chaque mission, et comment (Survol, Orbite ou Surface).',
    colonnes: [
      { nom: 'mission_id', type: 'INT', pk: true, ref: 'missions' },
      { nom: 'planete_id', type: 'INT', pk: true, ref: 'planetes' },
      { nom: 'mode', type: 'VARCHAR(10)' },
    ],
  },
];
