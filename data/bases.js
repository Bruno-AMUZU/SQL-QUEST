// Registre des bases disponibles. Pour en ajouter une : créer un dossier
// data/<id>/ sur le modèle de coupe_du_monde, l'importer ici, puis `npm run seed`.
import coupeDuMonde from './coupe_du_monde/index.js';
import systemeSolaire from './systeme_solaire/index.js';
import boulangerie from './boulangerie/index.js';
import mediatheque from './mediatheque/index.js';

const bases = [coupeDuMonde, systemeSolaire, boulangerie, mediatheque];

export default bases;
export const getBase = (id) => bases.find((b) => b.id === id);
