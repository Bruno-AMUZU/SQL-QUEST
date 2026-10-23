// Données réelles : fiches planétaires de la NASA (valeurs moyennes arrondies),
// dates de découverte des lunes et dates de lancement des sondes.
// Les lignes sont écrites avec les noms des planètes et des missions pour rester
// lisibles ; on les convertit en identifiants en bas du fichier.

const planetes = [
  // [nom, categorie, distance_soleil_mkm, diametre_km, duree_annee_jours, temperature_c, gravite]
  ['Mercure', 'Tellurique', 57.9, 4879, 88.0, 167, 3.7],
  ['Vénus', 'Tellurique', 108.2, 12104, 224.7, 464, 8.9],
  ['Terre', 'Tellurique', 149.6, 12756, 365.2, 15, 9.8],
  ['Mars', 'Tellurique', 227.9, 6792, 687.0, -65, 3.7],
  ['Jupiter', 'Géante gazeuse', 778.5, 142984, 4331.0, -110, 23.1],
  ['Saturne', 'Géante gazeuse', 1432.0, 120536, 10747.0, -140, 9.0],
  ['Uranus', 'Géante de glace', 2867.0, 51118, 30589.0, -195, 8.7],
  ['Neptune', 'Géante de glace', 4515.0, 49528, 59800.0, -200, 11.0],
];

const lunes = [
  // [nom, planete, diametre_km, annee_decouverte, decouvreur]
  ['Lune', 'Terre', 3475, null, null],
  ['Phobos', 'Mars', 22, 1877, 'Asaph Hall'],
  ['Deimos', 'Mars', 12, 1877, 'Asaph Hall'],
  ['Io', 'Jupiter', 3643, 1610, 'Galilée'],
  ['Europe', 'Jupiter', 3122, 1610, 'Galilée'],
  ['Ganymède', 'Jupiter', 5268, 1610, 'Galilée'],
  ['Callisto', 'Jupiter', 4821, 1610, 'Galilée'],
  ['Amalthée', 'Jupiter', 167, 1892, 'Edward Barnard'],
  ['Titan', 'Saturne', 5150, 1655, 'Christiaan Huygens'],
  ['Japet', 'Saturne', 1469, 1671, 'Jean-Dominique Cassini'],
  ['Rhéa', 'Saturne', 1527, 1672, 'Jean-Dominique Cassini'],
  ['Téthys', 'Saturne', 1062, 1684, 'Jean-Dominique Cassini'],
  ['Dioné', 'Saturne', 1123, 1684, 'Jean-Dominique Cassini'],
  ['Encelade', 'Saturne', 504, 1789, 'William Herschel'],
  ['Mimas', 'Saturne', 396, 1789, 'William Herschel'],
  ['Titania', 'Uranus', 1577, 1787, 'William Herschel'],
  ['Obéron', 'Uranus', 1523, 1787, 'William Herschel'],
  ['Ariel', 'Uranus', 1158, 1851, 'William Lassell'],
  ['Umbriel', 'Uranus', 1169, 1851, 'William Lassell'],
  ['Miranda', 'Uranus', 472, 1948, 'Gerard Kuiper'],
  ['Triton', 'Neptune', 2707, 1846, 'William Lassell'],
  ['Néréide', 'Neptune', 357, 1949, 'Gerard Kuiper'],
];

const missions = [
  // [nom, agence, date_lancement, { planete: mode }]
  ['Mariner 2', 'NASA', '1962-08-27', { 'Vénus': 'Survol' }],
  ['Mariner 4', 'NASA', '1964-11-28', { Mars: 'Survol' }],
  ['Venera 7', 'URSS', '1970-08-17', { 'Vénus': 'Surface' }],
  ['Pioneer 10', 'NASA', '1972-03-03', { Jupiter: 'Survol' }],
  ['Pioneer 11', 'NASA', '1973-04-06', { Jupiter: 'Survol', Saturne: 'Survol' }],
  ['Mariner 10', 'NASA', '1973-11-03', { 'Vénus': 'Survol', Mercure: 'Survol' }],
  ['Viking 1', 'NASA', '1975-08-20', { Mars: 'Surface' }],
  ['Voyager 2', 'NASA', '1977-08-20', { Jupiter: 'Survol', Saturne: 'Survol', Uranus: 'Survol', Neptune: 'Survol' }],
  ['Voyager 1', 'NASA', '1977-09-05', { Jupiter: 'Survol', Saturne: 'Survol' }],
  ['Venera 13', 'URSS', '1981-10-30', { 'Vénus': 'Surface' }],
  ['Galileo', 'NASA', '1989-10-18', { Jupiter: 'Orbite' }],
  ['Mars Pathfinder', 'NASA', '1996-12-04', { Mars: 'Surface' }],
  ['Cassini-Huygens', 'NASA / ESA', '1997-10-15', { Saturne: 'Orbite' }],
  ['Mars Express', 'ESA', '2003-06-02', { Mars: 'Orbite' }],
  ['Spirit', 'NASA', '2003-06-10', { Mars: 'Surface' }],
  ['MESSENGER', 'NASA', '2004-08-03', { Mercure: 'Orbite' }],
  ['Venus Express', 'ESA', '2005-11-09', { 'Vénus': 'Orbite' }],
  ['Akatsuki', 'JAXA', '2010-05-20', { 'Vénus': 'Orbite' }],
  ['Juno', 'NASA', '2011-08-05', { Jupiter: 'Orbite' }],
  ['Curiosity', 'NASA', '2011-11-26', { Mars: 'Surface' }],
  ['Mangalyaan', 'ISRO', '2013-11-05', { Mars: 'Orbite' }],
  ['Tianwen-1', 'CNSA', '2020-07-23', { Mars: 'Surface' }],
  ['Perseverance', 'NASA', '2020-07-30', { Mars: 'Surface' }],
];

// --- Conversion en lignes ---------------------------------------------------
const idPlanete = new Map(planetes.map(([nom], i) => [nom, i + 1]));
const id = (nom) => {
  if (!idPlanete.has(nom)) throw new Error(`Planète inconnue : ${nom}`);
  return idPlanete.get(nom);
};

export default {
  planetes: planetes.map((p, i) => [i + 1, ...p]),
  lunes: lunes.map(([nom, planete, diametre, annee, decouvreur], i) =>
    [i + 1, nom, id(planete), diametre, annee, decouvreur]),
  missions: missions.map(([nom, agence, date], i) => [i + 1, nom, agence, date]),
  visites: missions.flatMap(([, , , cibles], i) =>
    Object.entries(cibles).map(([planete, mode]) => [i + 1, id(planete), mode])),
};
