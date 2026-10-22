// Comparaison du résultat du joueur avec celui de la solution.
// Les noms de colonnes sont ignorés (alias libres) ; seules les valeurs comptent.

const NOMBRE = /^-?\d+(\.\d+)?$/;

function normaliser(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'bigint') return Number(v);
  if (typeof v === 'number') return Math.round(v * 100) / 100;
  if (typeof v === 'boolean') return v ? 1 : 0;
  const s = String(v).trim();
  // COUNT/SUM arrivent en texte selon le moteur (BIGINT, DECIMAL) : on les ramène en nombre
  if (NOMBRE.test(s)) return Math.round(Number(s) * 100) / 100;
  return s;
}

const cle = (ligne) => JSON.stringify(ligne);

function comparer(a, b) {
  if (a === b) return 0;
  if (a === null) return -1;
  if (b === null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'fr');
}

function estTrie(lignes, ordre) {
  for (let i = 1; i < lignes.length; i++) {
    for (const { col, desc } of ordre) {
      const c = comparer(lignes[i - 1][col], lignes[i][col]) * (desc ? -1 : 1);
      if (c < 0) break; // bien ordonné sur cette clé, on passe à la ligne suivante
      if (c > 0) return false;
    }
  }
  return true;
}

export function valider(attendu, obtenu, ordre) {
  const nbColsAttendu = attendu.columns.length;
  const nbColsObtenu = obtenu.columns.length;
  if (nbColsAttendu !== nbColsObtenu) {
    return {
      ok: false,
      raison: `${nbColsObtenu} colonne${nbColsObtenu > 1 ? 's' : ''} obtenue${nbColsObtenu > 1 ? 's' : ''}, ${nbColsAttendu} attendue${nbColsAttendu > 1 ? 's' : ''}`,
    };
  }
  const a = attendu.rows.map((r) => r.map(normaliser));
  const o = obtenu.rows.map((r) => r.map(normaliser));
  if (a.length !== o.length) {
    return { ok: false, raison: `${o.length} ligne${o.length > 1 ? 's' : ''} obtenue${o.length > 1 ? 's' : ''}, ${a.length} attendue${a.length > 1 ? 's' : ''}` };
  }
  const restantes = new Map();
  for (const l of a) restantes.set(cle(l), (restantes.get(cle(l)) ?? 0) + 1);
  for (const l of o) {
    const k = cle(l);
    if (!restantes.get(k)) {
      return { ok: false, raison: 'le bon nombre de lignes, mais certaines valeurs ne correspondent pas' };
    }
    restantes.set(k, restantes.get(k) - 1);
  }
  if (ordre?.length && !estTrie(o, ordre)) {
    return { ok: false, raison: 'les bonnes lignes, mais pas dans le bon ordre' };
  }
  return { ok: true, raison: `${a.length} ligne${a.length > 1 ? 's' : ''} attendue${a.length > 1 ? 's' : ''}, ${o.length} obtenue${o.length > 1 ? 's' : ''}` };
}
