// Éditeur SQL : un <textarea> transparent posé sur un <pre> coloré.
const MOTS_CLES = new Set(`
  SELECT FROM WHERE AND OR NOT IN IS NULL AS JOIN INNER LEFT RIGHT FULL OUTER CROSS ON USING
  GROUP BY ORDER HAVING LIMIT OFFSET DISTINCT ASC DESC UNION ALL INTERSECT EXCEPT CASE WHEN THEN
  ELSE END LIKE ILIKE BETWEEN EXISTS ANY SOME WITH RECURSIVE INSERT INTO VALUES UPDATE SET DELETE
  CREATE TABLE DROP ALTER INDEX VIEW TRUE FALSE NULLS FIRST LAST OVER PARTITION FETCH NEXT ROWS ONLY
`.trim().split(/\s+/));

const FONCTIONS = new Set(`
  COUNT SUM AVG MIN MAX ROUND UPPER LOWER LENGTH CHAR_LENGTH CONCAT SUBSTRING SUBSTR TRIM COALESCE
  NULLIF ABS CAST NOW CURRENT_DATE EXTRACT YEAR REPLACE LEFT RIGHT ROW_NUMBER RANK DENSE_RANK
  STRING_AGG GROUP_CONCAT IFNULL FLOOR CEIL CEILING POSITION LPAD RPAD
`.trim().split(/\s+/));

const TOKEN = /(--[^\n]*)|('(?:[^']|'')*'?)|("(?:[^"])*"?|`[^`]*`?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][\w$]*)|(<=|>=|<>|!=|[=<>*+\-/%])|([(),;.])/g;

const echapper = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function colorer(sql) {
  let html = '';
  let dernier = 0;
  for (const m of sql.matchAll(TOKEN)) {
    html += echapper(sql.slice(dernier, m.index));
    const [texte, com, str, ident, num, mot, op, punct] = m;
    const e = echapper(texte);
    if (com) html += `<span class="tok-com">${e}</span>`;
    else if (str) html += `<span class="tok-str">${e}</span>`;
    else if (ident) html += e;
    else if (num) html += `<span class="tok-num">${e}</span>`;
    else if (mot) {
      const u = mot.toUpperCase();
      const suivi = /^\s*\(/.test(sql.slice(m.index + texte.length));
      if (FONCTIONS.has(u) && suivi) html += `<span class="tok-fn">${e}</span>`;
      else if (MOTS_CLES.has(u)) html += `<span class="tok-kw">${e}</span>`;
      else html += e;
    } else if (op) html += `<span class="tok-op">${e}</span>`;
    else if (punct) html += `<span class="tok-punct">${e}</span>`;
    dernier = m.index + texte.length;
  }
  return html + echapper(sql.slice(dernier));
}

export const KEYWORDS = [...MOTS_CLES];

export function creerEditeur({ textarea, highlight, gutter, onRun, onChange }) {
  // Une <div> par ligne : on peut ainsi mesurer la hauteur de chaque ligne
  // (retour à la ligne automatique) et aligner les numéros dans la marge.
  function rafraichir() {
    const lignes = textarea.value.split('\n');
    highlight.innerHTML = lignes.map((l) => `<div>${colorer(l) || ' '}</div>`).join('');
    aligner();
  }

  function aligner() {
    const hauteurs = [...highlight.children].map((d) => d.offsetHeight);
    const base = parseFloat(getComputedStyle(highlight).lineHeight) || 20;
    const total = Math.max(hauteurs.length, 8);
    gutter.innerHTML = Array.from({ length: total }, (_, i) =>
      `<div style="height:${hauteurs[i] ?? base}px">${i + 1}</div>`).join('');
  }

  new ResizeObserver(aligner).observe(highlight);

  textarea.addEventListener('input', () => {
    rafraichir();
    onChange?.(textarea.value);
  });

  textarea.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onRun();
    } else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      document.execCommand('insertText', false, '  ');
    }
  });

  textarea.closest('.code-area')?.addEventListener('mousedown', (e) => {
    if (e.target !== textarea) {
      e.preventDefault();
      textarea.focus();
    }
  });

  rafraichir();

  return {
    get valeur() { return textarea.value; },
    // Remplace le contenu en conservant l'historique d'annulation (Ctrl+Z) quand c'est possible
    remplacer(texte, { focus = true } = {}) {
      if (focus) {
        textarea.focus();
        textarea.select();
        if (!document.execCommand('insertText', false, texte)) textarea.value = texte;
      } else {
        textarea.value = texte;
      }
      rafraichir();
      onChange?.(textarea.value);
    },
    // Chargement silencieux (changement de niveau) : pas d'entrée dans l'historique
    charger(texte) {
      textarea.value = texte;
      rafraichir();
    },
  };
}
