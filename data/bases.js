// Registre des bases disponibles. Pour en ajouter une : créer un dossier
// data/<id>/ sur le modèle de coupe_du_monde, l'importer ici, puis `npm run seed`.
import coupeDuMonde from './coupe_du_monde/index.js';

const bases = [coupeDuMonde];

export default bases;
export const getBase = (id) => bases.find((b) => b.id === id);
