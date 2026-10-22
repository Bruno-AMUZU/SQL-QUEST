// Préférences et progression du joueur, dans le localStorage du navigateur.
const CLE = 'sqlquest';

let etat = {};
try {
  etat = JSON.parse(localStorage.getItem(CLE) || '{}') || {};
} catch {
  etat = {};
}

function sauver() {
  try {
    localStorage.setItem(CLE, JSON.stringify(etat));
  } catch { /* navigation privée, stockage plein… : on continue sans */ }
}

export const store = {
  get(cle, defaut) {
    return etat[cle] ?? defaut;
  },
  set(cle, valeur) {
    etat[cle] = valeur;
    sauver();
  },
  // Sous-objet par base (progression, brouillons, historique)
  getBase(base, cle, defaut) {
    return etat.bases?.[base]?.[cle] ?? defaut;
  },
  setBase(base, cle, valeur) {
    etat.bases ??= {};
    etat.bases[base] ??= {};
    etat.bases[base][cle] = valeur;
    sauver();
  },
};
