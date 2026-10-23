// Chaque niveau : la requête du joueur doit renvoyer les mêmes lignes que `solution`
// (noms de colonnes libres). `ordre` liste les colonnes (index 0-based) sur lesquelles
// le résultat doit être trié ; sans `ordre`, l'ordre des lignes est ignoré.
// Les solutions sont écrites en SQL standard, valable sur MySQL et PostgreSQL.
export default [
  {
    titre: '🪐 Tour d’horizon',
    tags: ['SELECT'],
    enonce: 'Affichez toutes les colonnes de toutes les lignes de la table planetes.',
    indice: 'L’étoile * sélectionne toutes les colonnes : SELECT * FROM …',
    solution: 'SELECT * FROM planetes',
  },
  {
    titre: '📏 Mesurer les géants',
    tags: ['SELECT'],
    enonce: 'Affichez uniquement le nom et le diamètre de chaque planète.',
    indice: 'Listez les colonnes voulues séparées par des virgules après SELECT.',
    solution: 'SELECT nom, diametre_km FROM planetes',
  },
  {
    titre: '🪨 Des planètes rocheuses',
    tags: ['WHERE'],
    enonce: 'Affichez le nom des planètes de catégorie « Tellurique ».',
    indice: 'Filtrez avec WHERE categorie = \'Tellurique\' (les textes s’écrivent entre apostrophes).',
    solution: "SELECT nom FROM planetes WHERE categorie = 'Tellurique'",
  },
  {
    titre: '☀️ En partant du Soleil',
    tags: ['ORDER BY'],
    enonce: 'Affichez le nom et la distance au Soleil de chaque planète, de la plus éloignée à la plus proche.',
    indice: 'ORDER BY distance_soleil_mkm DESC trie du plus grand au plus petit.',
    solution: 'SELECT nom, distance_soleil_mkm FROM planetes ORDER BY distance_soleil_mkm DESC',
    ordre: [{ col: 1, desc: true }],
  },
  {
    titre: '🚀 Qui va dans l’espace ?',
    tags: ['DISTINCT'],
    enonce: 'Affichez la liste des agences spatiales de la table missions, chacune une seule fois.',
    indice: 'SELECT DISTINCT supprime les doublons du résultat.',
    solution: 'SELECT DISTINCT agence FROM missions',
  },
  {
    titre: '🔭 Les extrêmes',
    tags: ['MIN', 'MAX'],
    enonce: 'Affichez sur une seule ligne le plus petit et le plus grand diamètre de planète.',
    indice: 'MIN(colonne) et MAX(colonne) renvoient la plus petite et la plus grande valeur.',
    solution: 'SELECT MIN(diametre_km), MAX(diametre_km) FROM planetes',
  },
  {
    titre: '🌡️ Moyenne glaciale',
    tags: ['AVG', 'WHERE'],
    enonce: 'Quelle est la température moyenne des planètes dont la température est négative ? Renvoyez un seul nombre.',
    indice: 'AVG(temperature_c) calcule une moyenne ; filtrez d’abord avec WHERE temperature_c < 0.',
    solution: 'SELECT AVG(temperature_c) FROM planetes WHERE temperature_c < 0',
  },
  {
    titre: '📜 Le siècle de Galilée',
    tags: ['BETWEEN'],
    enonce: 'Affichez le nom et l’année de découverte des lunes découvertes entre 1600 et 1699 inclus.',
    indice: 'annee_decouverte BETWEEN 1600 AND 1699 inclut les deux bornes.',
    solution: 'SELECT nom, annee_decouverte FROM lunes WHERE annee_decouverte BETWEEN 1600 AND 1699',
  },
  {
    titre: '🇪🇺 La touche européenne',
    tags: ['LIKE'],
    enonce: 'Affichez le nom des missions auxquelles l’agence européenne ESA a participé, seule ou avec une autre agence.',
    indice: 'LIKE accepte des jokers : % remplace n’importe quelle suite de caractères. Essayez agence LIKE \'%ESA%\'.',
    solution: "SELECT nom FROM missions WHERE agence LIKE '%ESA%'",
  },
  {
    titre: '🌙 Personne ne l’a découverte',
    tags: ['IS NULL'],
    enonce: 'Une seule lune n’a pas d’année de découverte : on la voit depuis toujours. Affichez son nom.',
    indice: 'On teste une valeur vide avec IS NULL, jamais avec =.',
    solution: 'SELECT nom FROM lunes WHERE annee_decouverte IS NULL',
  },
  {
    titre: '🔗 Qui tourne autour de qui ?',
    tags: ['JOIN'],
    enonce: 'Pour chaque lune, affichez son nom et le nom de sa planète.',
    indice: 'Joignez lunes et planetes : JOIN planetes p ON p.id = l.planete_id. Les deux tables ont une colonne nom : préfixez-la (l.nom, p.nom).',
    solution: 'SELECT l.nom, p.nom FROM lunes l JOIN planetes p ON p.id = l.planete_id',
  },
  {
    titre: '🛰️ Compter les satellites',
    tags: ['GROUP BY', 'JOIN'],
    enonce: 'Affichez le nom de chaque planète ayant au moins une lune dans la table, avec son nombre de lunes, de la plus entourée à la moins entourée.',
    indice: 'Joignez lunes et planetes, regroupez par planète avec GROUP BY, comptez avec COUNT(*) et triez par ce nombre décroissant.',
    solution: `SELECT p.nom, COUNT(*) AS nb_lunes
FROM lunes l
JOIN planetes p ON p.id = l.planete_id
GROUP BY p.id, p.nom
ORDER BY nb_lunes DESC`,
    ordre: [{ col: 1, desc: true }],
  },
  {
    titre: '🌑 Les solitaires aussi',
    tags: ['LEFT JOIN', 'GROUP BY'],
    enonce: 'Affichez toutes les planètes avec leur nombre de lunes, y compris celles qui n’en ont aucune (0).',
    indice: 'Partez de planetes et faites un LEFT JOIN vers lunes ; COUNT(l.id) compte alors 0 pour les planètes sans lune.',
    solution: `SELECT p.nom, COUNT(l.id) AS nb_lunes
FROM planetes p
LEFT JOIN lunes l ON l.planete_id = p.id
GROUP BY p.id, p.nom`,
  },
  {
    titre: '💫 Les visiteurs des anneaux',
    tags: ['JOIN', 'N-N'],
    enonce: 'Affichez le nom des missions qui ont étudié Saturne.',
    indice: 'La table visites relie missions et planetes : joignez les trois tables (missions → visites → planetes) puis filtrez sur p.nom = \'Saturne\'.',
    solution: `SELECT m.nom
FROM missions m
JOIN visites v ON v.mission_id = m.id
JOIN planetes p ON p.id = v.planete_id
WHERE p.nom = 'Saturne'`,
  },
  {
    titre: '📅 Les années chargées',
    tags: ['EXTRACT', 'HAVING'],
    enonce: 'Affichez chaque année au cours de laquelle au moins 2 missions ont été lancées, avec le nombre de lancements.',
    indice: 'EXTRACT(YEAR FROM date_lancement) donne l’année d’une date. Regroupez par cette expression et gardez les groupes avec HAVING COUNT(*) >= 2.',
    solution: `SELECT EXTRACT(YEAR FROM date_lancement) AS annee, COUNT(*) AS nb
FROM missions
GROUP BY EXTRACT(YEAR FROM date_lancement)
HAVING COUNT(*) >= 2`,
  },
  {
    titre: '🤯 Plus grosses qu’une planète',
    tags: ['SOUS-REQUÊTE'],
    enonce: 'Certaines lunes sont plus grandes que la planète Mercure ! Affichez leur nom et leur diamètre.',
    indice: 'Comparez à une sous-requête qui renvoie une seule valeur : diametre_km > (SELECT diametre_km FROM planetes WHERE nom = \'Mercure\').',
    solution: `SELECT nom, diametre_km FROM lunes
WHERE diametre_km > (SELECT diametre_km FROM planetes WHERE nom = 'Mercure')`,
  },
  {
    titre: '🧭 Dedans ou dehors ?',
    tags: ['CASE'],
    enonce: 'La ceinture d’astéroïdes se trouve à environ 400 millions de km du Soleil. Affichez le nom de chaque planète et le texte « interne » si elle est à moins de 400 millions de km, sinon « externe ».',
    indice: 'CASE WHEN condition THEN \'interne\' ELSE \'externe\' END crée une colonne calculée.',
    solution: `SELECT nom,
  CASE WHEN distance_soleil_mkm < 400 THEN 'interne' ELSE 'externe' END AS zone
FROM planetes`,
  },
];
