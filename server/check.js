// Vérifie que chaque niveau est réussi par sa propre solution sur les deux moteurs,
// que MySQL et PostgreSQL donnent le même résultat, et que l'utilisateur lecteur
// ne peut pas modifier les données.
import bases from '../data/bases.js';
import { execute, formatError, closeAll, SGBD } from './engines.js';
import { valider } from './validate.js';

let echecs = 0;
for (const base of bases) {
  const resultats = base.niveaux.map(() => ({}));
  for (const sgbd of SGBD) {
    for (const [i, niveau] of base.niveaux.entries()) {
      const nom = `${base.id} · ${sgbd} · niveau ${i + 1}`;
      try {
        const r = await execute(sgbd, base.id, niveau.solution);
        const v = valider(r, r, niveau.ordre);
        if (!v.ok) throw new Error(v.raison);
        resultats[i][sgbd] = r;
        console.log(`✓ ${nom} (${r.rows.length} lignes)`);
      } catch (e) {
        echecs++;
        console.log(`✕ ${nom} : ${formatError(sgbd, e).message}`);
      }
    }
    try {
      await execute(sgbd, base.id, `DELETE FROM ${base.tables.at(-1).nom}`);
      echecs++;
      console.log(`✕ ${base.id} · ${sgbd} : DELETE autorisé !`);
    } catch (e) {
      console.log(`✓ ${base.id} · ${sgbd} : écriture refusée (${formatError(sgbd, e).message})`);
    }
  }
  // Un joueur sur MySQL doit voir la même réponse attendue qu'un joueur sur PostgreSQL
  for (const [i, { mysql, postgres }] of resultats.entries()) {
    if (!mysql || !postgres) continue;
    const v = valider(mysql, postgres, base.niveaux[i].ordre);
    if (v.ok) continue;
    echecs++;
    console.log(`✕ ${base.id} · niveau ${i + 1} : MySQL et PostgreSQL diffèrent (${v.raison})`);
  }
}
await closeAll();
process.exit(echecs ? 1 : 0);
