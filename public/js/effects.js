// Effets de victoire (confettis) et d'échec (tremblement + flash rouge).
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
const COULEURS = ['#34D399', '#3B82F6', '#F5C66B', '#A78BFA', '#F87171', '#7FB2FF'];
const reduit = matchMedia('(prefers-reduced-motion: reduce)');

let particules = [];
let anim = null;

function boucle() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particules = particules.filter((p) => p.y < canvas.height + 20 && p.vie > 0);
  for (const p of particules) {
    p.vy += 0.25 * devicePixelRatio;
    p.vx *= 0.99;
    p.x += p.vx;
    p.y += p.vy;
    p.angle += p.spin;
    p.vie -= 1;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);
    ctx.globalAlpha = Math.min(1, p.vie / 40);
    ctx.fillStyle = p.couleur;
    ctx.fillRect(-p.t / 2, -p.t / 4, p.t, p.t / 2);
    ctx.restore();
  }
  anim = particules.length ? requestAnimationFrame(boucle) : null;
  if (!anim) ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function confettis() {
  if (reduit.matches) return;
  const dpr = devicePixelRatio;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  for (const origine of [0.25, 0.75]) {
    for (let i = 0; i < 90; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
      const vitesse = (8 + Math.random() * 10) * dpr;
      particules.push({
        x: canvas.width * origine,
        y: canvas.height * 0.65,
        vx: Math.cos(angle) * vitesse,
        vy: Math.sin(angle) * vitesse,
        angle: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.3,
        t: (6 + Math.random() * 6) * dpr,
        couleur: COULEURS[i % COULEURS.length],
        vie: 120 + Math.random() * 60,
      });
    }
  }
  if (!anim) anim = requestAnimationFrame(boucle);
}

function rejouer(el, classe) {
  el.classList.remove(classe);
  void el.offsetWidth; // relance l'animation CSS
  el.classList.add(classe);
  el.addEventListener('animationend', () => el.classList.remove(classe), { once: true });
}

export function echec(editeur, zone) {
  if (!reduit.matches) rejouer(editeur, 'shake');
  rejouer(zone, 'flash');
}
