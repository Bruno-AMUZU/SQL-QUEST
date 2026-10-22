// Chaque niveau : la requête du joueur doit renvoyer les mêmes lignes que `solution`
// (noms de colonnes libres). `ordre` liste les colonnes (index 0-based) sur lesquelles
// le résultat doit être trié ; sans `ordre`, l'ordre des lignes est ignoré.
// Les solutions sont écrites en SQL standard, valable sur MySQL et PostgreSQL.
export default [
  {
    titre: '🌍 Faites l’appel',
    tags: ['SELECT'],
    enonce: 'Affichez toutes les colonnes de toutes les lignes de la table pays.',
    indice: 'L’étoile * sélectionne toutes les colonnes : SELECT * FROM …',
    solution: 'SELECT * FROM pays',
  },
  {
    titre: '🗺️ Juste l’essentiel',
    tags: ['SELECT'],
    enonce: 'Affichez uniquement le nom et le continent de chaque pays.',
    indice: 'Listez les colonnes voulues séparées par des virgules après SELECT.',
    solution: 'SELECT nom, continent FROM pays',
  },
  {
    titre: '🌍 Cap sur l’Afrique',
    tags: ['WHERE'],
    enonce: 'Affichez le nom des pays dont le continent est « Afrique ».',
    indice: 'Filtrez avec WHERE continent = \'Afrique\' (les textes s’écrivent entre apostrophes).',
    solution: "SELECT nom FROM pays WHERE continent = 'Afrique'",
  },
  {
    titre: '📅 Remonter le temps',
    tags: ['ORDER BY'],
    enonce: 'Affichez l’année et le nombre de buts de chaque édition, de la plus récente à la plus ancienne.',
    indice: 'ORDER BY annee DESC trie du plus grand au plus petit.',
    solution: 'SELECT annee, nb_buts FROM editions ORDER BY annee DESC',
    ordre: [{ col: 0, desc: true }],
  },
  {
    titre: '⚽ Festival de buts',
    tags: ['ORDER BY', 'LIMIT'],
    enonce: 'Affichez l’année et le nombre de buts des 5 éditions les plus prolifiques, de la plus prolifique à la moins prolifique.',
    indice: 'Triez par nb_buts décroissant puis gardez 5 lignes avec LIMIT 5.',
    solution: 'SELECT annee, nb_buts FROM editions ORDER BY nb_buts DESC LIMIT 5',
    ordre: [{ col: 1, desc: true }],
  },
  {
    titre: '🔢 Combien de fêtes ?',
    tags: ['COUNT'],
    enonce: 'Combien d’éditions de la Coupe du monde ont été disputées ? Renvoyez un seul nombre.',
    indice: 'COUNT(*) compte les lignes d’une table.',
    solution: 'SELECT COUNT(*) FROM editions',
  },
  {
    titre: '🏟️ L’ère moderne',
    tags: ['WHERE', 'AND'],
    enonce: 'Affichez l’année des éditions à 32 équipes où plus de 160 buts ont été marqués.',
    indice: 'Combinez deux conditions avec AND : nb_equipes = 32 AND nb_buts > 160.',
    solution: 'SELECT annee FROM editions WHERE nb_equipes = 32 AND nb_buts > 160',
  },
  {
    titre: '🤝 Organisation à deux',
    tags: ['IS NULL'],
    enonce: 'Une seule édition a été co-organisée par deux pays. Affichez son année.',
    indice: 'La colonne co_hote_id est vide (NULL) sauf pour cette édition. On teste NULL avec IS NULL / IS NOT NULL, jamais avec =.',
    solution: 'SELECT annee FROM editions WHERE co_hote_id IS NOT NULL',
  },
  {
    titre: '🏆 Le nom des champions',
    tags: ['JOIN'],
    enonce: 'Pour chaque édition, affichez l’année et le nom du pays vainqueur.',
    indice: 'Joignez editions et pays : JOIN pays p ON p.id = e.vainqueur_id.',
    solution: 'SELECT e.annee, p.nom FROM editions e JOIN pays p ON p.id = e.vainqueur_id',
  },
  {
    titre: '🏆 Les champions du monde',
    tags: ['GROUP BY', 'JOIN'],
    enonce: 'Trouvez le nombre de Coupes du monde gagnées par chaque pays. Affichez le nom du pays et son nombre de titres, du plus titré au moins titré.',
    indice: 'La colonne vainqueur_id de editions pointe vers pays.id. Regroupez par pays avec GROUP BY et comptez avec COUNT(*).',
    solution: `SELECT p.nom, COUNT(*) AS titres
FROM editions e
JOIN pays p ON p.id = e.vainqueur_id
GROUP BY p.nom
ORDER BY titres DESC`,
    ordre: [{ col: 1, desc: true }],
  },
  {
    titre: '⭐ Le club des multi-titrés',
    tags: ['HAVING'],
    enonce: 'Affichez le nom des pays ayant gagné au moins 3 Coupes du monde, avec leur nombre de titres.',
    indice: 'WHERE filtre les lignes avant le regroupement ; HAVING filtre les groupes après : HAVING COUNT(*) >= 3.',
    solution: `SELECT p.nom, COUNT(*) AS titres
FROM editions e
JOIN pays p ON p.id = e.vainqueur_id
GROUP BY p.nom
HAVING COUNT(*) >= 3`,
  },
  {
    titre: '🏠 Champion à domicile',
    tags: ['JOIN', 'WHERE'],
    enonce: 'Affichez l’année et le nom du pays pour chaque édition remportée par le pays organisateur.',
    indice: 'Comparez deux colonnes de la même ligne : WHERE e.vainqueur_id = e.hote_id.',
    solution: `SELECT e.annee, p.nom
FROM editions e
JOIN pays p ON p.id = e.vainqueur_id
WHERE e.vainqueur_id = e.hote_id`,
  },
  {
    titre: '🔗 Double jointure',
    tags: ['JOIN', 'ALIAS'],
    enonce: 'Pour chaque édition, affichez l’année, le nom du pays hôte et le nom du vainqueur.',
    indice: 'Joignez deux fois la table pays avec deux alias différents : JOIN pays h ON … JOIN pays v ON …',
    solution: `SELECT e.annee, h.nom AS hote, v.nom AS vainqueur
FROM editions e
JOIN pays h ON h.id = e.hote_id
JOIN pays v ON v.id = e.vainqueur_id`,
  },
  {
    titre: '👟 Les meilleurs buteurs de l’histoire',
    tags: ['SUM', 'GROUP BY', 'LIMIT'],
    enonce: 'Affichez le nom et le total de buts des 5 meilleurs buteurs de l’histoire de la Coupe du monde, du meilleur au moins bon.',
    indice: 'Joignez buteurs et joueurs, additionnez avec SUM(b.buts), regroupez par joueur, triez puis LIMIT 5.',
    solution: `SELECT j.nom, SUM(b.buts) AS total
FROM buteurs b
JOIN joueurs j ON j.id = b.joueur_id
GROUP BY j.id, j.nom
ORDER BY total DESC
LIMIT 5`,
    ordre: [{ col: 1, desc: true }],
  },
  {
    titre: '😢 Si près du but',
    tags: ['SOUS-REQUÊTE', 'IN'],
    enonce: 'Affichez le nom des pays qui ont déjà perdu une finale mais n’ont jamais gagné la Coupe du monde.',
    indice: 'Utilisez deux sous-requêtes : id IN (SELECT finaliste_id FROM editions) AND id NOT IN (SELECT vainqueur_id FROM editions).',
    solution: `SELECT nom FROM pays
WHERE id IN (SELECT finaliste_id FROM editions)
  AND id NOT IN (SELECT vainqueur_id FROM editions)`,
  },
  {
    titre: '🇪🇺 Toute l’Europe, même les zéros',
    tags: ['LEFT JOIN', 'GROUP BY'],
    enonce: 'Affichez tous les pays d’Europe avec leur nombre de titres, y compris ceux qui n’en ont aucun (0).',
    indice: 'Un LEFT JOIN garde les pays sans édition gagnée ; COUNT(e.annee) compte alors 0 pour eux.',
    solution: `SELECT p.nom, COUNT(e.annee) AS titres
FROM pays p
LEFT JOIN editions e ON e.vainqueur_id = p.id
WHERE p.continent = 'Europe'
GROUP BY p.id, p.nom`,
  },
];
