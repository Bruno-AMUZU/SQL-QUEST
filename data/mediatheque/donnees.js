// Auteurs et livres réels (année de première publication de l'œuvre originale) ;
// adhérents et emprunts fictifs, de janvier 2025 à octobre 2026.

const auteurs = [
  // [nom, nationalite, annee_naissance, annee_deces]
  ['Victor Hugo', 'Française', 1802, 1885],
  ['Albert Camus', 'Française', 1913, 1960],
  ['Jules Verne', 'Française', 1828, 1905],
  ['George Orwell', 'Britannique', 1903, 1950],
  ['Agatha Christie', 'Britannique', 1890, 1976],
  ['Gabriel García Márquez', 'Colombienne', 1927, 2014],
  ['Chimamanda Ngozi Adichie', 'Nigériane', 1977, null],
  ['Haruki Murakami', 'Japonaise', 1949, null],
  ['Annie Ernaux', 'Française', 1940, null],
  ['Amin Maalouf', 'Franco-libanaise', 1949, null],
  ['J. K. Rowling', 'Britannique', 1965, null],
  ['Antoine de Saint-Exupéry', 'Française', 1900, 1944],
  ['Toni Morrison', 'Américaine', 1931, 2019],
  ['Mariama Bâ', 'Sénégalaise', 1929, 1981],
];

const livres = [
  // [titre, auteur_id, annee_publication, genre]
  ['Les Misérables', 1, 1862, 'Roman'],
  ['Notre-Dame de Paris', 1, 1831, 'Roman'],
  ['Les Contemplations', 1, 1856, 'Poésie'],
  ['L’Étranger', 2, 1942, 'Roman'],
  ['La Peste', 2, 1947, 'Roman'],
  ['Vingt mille lieues sous les mers', 3, 1870, 'Aventure'],
  ['Le Tour du monde en quatre-vingts jours', 3, 1872, 'Aventure'],
  ['De la Terre à la Lune', 3, 1865, 'Science-fiction'],
  ['1984', 4, 1949, 'Science-fiction'],
  ['La Ferme des animaux', 4, 1945, 'Roman'],
  ['Le Crime de l’Orient-Express', 5, 1934, 'Policier'],
  ['Mort sur le Nil', 5, 1937, 'Policier'],
  ['Ils étaient dix', 5, 1939, 'Policier'],
  ['Cent ans de solitude', 6, 1967, 'Roman'],
  ['Chronique d’une mort annoncée', 6, 1981, 'Roman'],
  ['L’Autre Moitié du soleil', 7, 2006, 'Roman'],
  ['Americanah', 7, 2013, 'Roman'],
  ['Kafka sur le rivage', 8, 2002, 'Roman'],
  ['1Q84', 8, 2009, 'Roman'],
  ['Les Années', 9, 2008, 'Récit'],
  ['La Place', 9, 1983, 'Récit'],
  ['Léon l’Africain', 10, 1986, 'Roman'],
  ['Samarcande', 10, 1988, 'Roman'],
  ['Harry Potter à l’école des sorciers', 11, 1997, 'Fantasy'],
  ['Harry Potter et la Chambre des secrets', 11, 1998, 'Fantasy'],
  ['Le Petit Prince', 12, 1943, 'Conte'],
  ['Vol de nuit', 12, 1931, 'Roman'],
  ['Beloved', 13, 1987, 'Roman'],
  ['Une si longue lettre', 14, 1979, 'Roman'],
];

const adherents = [
  // [prenom, nom, date_adhesion]
  ['Amina', 'Diallo', '2024-01-10'],
  ['Bastien', 'Leroy', '2024-02-18'],
  ['Clara', 'Fontaine', '2024-04-02'],
  ['David', 'Nguyen', '2024-06-25'],
  ['Emma', 'Rousseau', '2024-09-09'],
  ['Farid', 'Benali', '2025-01-14'],
  ['Gaëlle', 'Morel', '2025-03-30'],
  ['Hector', 'Blanc', '2025-08-21'],
];

const emprunts = [
  // [livre_id, adherent_id, date_emprunt, date_retour]
  [26, 1, '2025-01-15', '2025-01-29'],
  [9, 2, '2025-02-20', '2025-03-10'],
  [24, 3, '2025-04-05', '2025-04-20'],
  [11, 1, '2025-02-03', '2025-02-17'],
  [26, 4, '2025-07-01', '2025-07-12'],
  [14, 5, '2025-09-12', '2025-10-20'],
  [9, 4, '2025-07-15', '2025-08-02'],
  [6, 6, '2025-01-20', '2025-02-08'],
  [12, 1, '2025-03-01', '2025-03-14'],
  [24, 6, '2025-03-02', '2025-03-25'],
  [17, 3, '2025-05-11', '2025-06-01'],
  [26, 2, '2025-06-03', '2025-06-10'],
  [4, 5, '2025-10-01', '2025-10-15'],
  [8, 6, '2025-04-10', '2025-05-02'],
  [13, 1, '2025-05-06', '2025-05-19'],
  [9, 7, '2025-05-02', '2025-05-30'],
  [20, 3, '2025-08-18', '2025-09-05'],
  [26, 7, '2025-09-01', '2025-09-08'],
  [16, 4, '2025-11-03', '2025-11-28'],
  [1, 2, '2025-12-01', '2026-01-15'],
  [24, 5, '2026-01-04', '2026-01-20'],
  [29, 3, '2026-02-14', '2026-03-01'],
  [9, 1, '2026-03-03', '2026-03-21'],
  [18, 2, '2026-04-07', '2026-05-02'],
  [7, 6, '2026-05-15', '2026-06-01'],
  [22, 4, '2026-06-10', '2026-07-05'],
  [26, 5, '2026-07-20', '2026-08-01'],
  [28, 3, '2026-08-22', null],
  [19, 2, '2026-09-10', null],
  [15, 6, '2026-09-28', null],
  [11, 7, '2026-10-05', null],
  [5, 1, '2026-10-12', null],
  [25, 6, '2026-10-15', null],
  [2, 5, '2026-10-18', null],
];

// --- Conversion en lignes ---------------------------------------------------
const avecId = (lignes) => lignes.map((l, i) => [i + 1, ...l]);

export default {
  auteurs: avecId(auteurs),
  livres: avecId(livres),
  adherents: avecId(adherents),
  emprunts: avecId(emprunts),
};
