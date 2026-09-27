// Menu burger (mobile)
const burger = document.getElementById('burger');
const nav = document.querySelector('.nav');

if (burger && nav) {
  burger.addEventListener('click', () => {
    nav.classList.toggle('open');
  });

  document.querySelectorAll('.nav a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
    });
  });
}

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ============================================================
// SPLAT TRANSITION — une tomate lancée comme mécanisme de navigation.
// Séquence : tomate -> impact -> éclaboussure -> distorsion -> portail -> section suivante.
//
// Tous les curseurs d'intensité/violence sont ici : ajuste ces
// valeurs pour changer le rendu sans toucher à la logique.
// ============================================================
const TOMATO_FX = {
  TOMATO_SIZE: 1,          // multiplicateur de la taille de la tomate
  TOMATO_SPEED: 1,         // multiplicateur de vitesse du vol (2 = deux fois plus rapide)
  TOMATO_GLOW: 1,          // multiplicateur du halo autour de la tomate
  IMPACT_POWER: 1,         // intensité globale de l'impact (flash, avatar, particules)
  SHOCKWAVE_SIZE: 1,       // multiplicateur de la taille des ondes de choc
  SHOCKWAVE_SPEED: 1,      // multiplicateur de vitesse des ondes (2 = deux fois plus rapide)
  SHOCKWAVE_GLOW: 1,       // intensité lumineuse des ondes
  SCREEN_SHAKE: 1,         // intensité du tremblement d'écran (0 = désactivé)
  DISTORTION_AMOUNT: 1,    // intensité de l'onde de distorsion (backdrop-filter)
  PARTICLE_COUNT: 18,      // nombre de gouttes/pépins projetés à l'impact
  TRANSITION_DURATION: 1,  // multiplicateur de la durée du portail final
};

function easeInCubic(t) { return t * t * t; }
function easeInExpo(t) { return t <= 0 ? 0 : Math.pow(2, 10 * (t - 1)); }
function easeOutExpo(t) { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }
function easeInOutSine(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }

function quadBezier(p0, pc, p2, t) {
  const mt = 1 - t;
  return {
    x: mt * mt * p0.x + 2 * mt * t * pc.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * pc.y + t * t * p2.y,
  };
}

function lerp(a, b, t) { return a + (b - a) * t; }

// Traînée de jus : rose pâle qui vire au rouge tomate en approchant l'impact.
function trailColor(t) {
  const stops = [
    { r: 255, g: 205, b: 190 },
    { r: 255, g: 107, b: 74 },
    { r: 198, g: 58, b: 30 },
  ];
  const scaled = Math.min(t, 0.999) * (stops.length - 1);
  const i = Math.floor(scaled);
  const local = scaled - i;
  const a = stops[i];
  const b = stops[i + 1];
  return `rgb(${Math.round(lerp(a.r, b.r, local))}, ${Math.round(lerp(a.g, b.g, local))}, ${Math.round(lerp(a.b, b.b, local))})`;
}

function fadeAndRemove(el, keyframes, duration, easing) {
  const anim = el.animate(keyframes, { duration, easing, fill: 'forwards' });
  anim.addEventListener('finish', () => el.remove());
}

// Silhouette de tomate façon asset de jeu : corps rond au dégradé glacé,
// calice à 5 feuilles, reflet brillant — même style graphique que le reste
// du portfolio (illustration 2D, formes arrondies, rendu cartoon soigné).
// Dessinée dans un viewBox 0 0 100 100, centrée en (50,50).
const TOMATO_CALYX_PATH = 'M 50.00 9.00 L 53.06 17.79 L 62.36 17.98 L 54.95 23.61 ' +
  'L 57.64 32.52 L 50.00 27.20 L 42.36 32.52 L 45.05 23.61 L 37.64 17.98 L 46.94 17.79 Z';

const SVG_NS = 'http://www.w3.org/2000/svg';

function createTomatoElement() {
  const wrap = document.createElement('div');
  wrap.className = 'nav-tomato-wrap';

  const halo = document.createElement('span');
  halo.className = 'nav-tomato__halo';
  const haloSize = 150 * TOMATO_FX.TOMATO_GLOW;
  halo.style.width = halo.style.height = `${haloSize}px`;

  const coreSize = 76 * TOMATO_FX.TOMATO_SIZE;
  const core = document.createElementNS(SVG_NS, 'svg');
  core.setAttribute('class', 'nav-tomato__core');
  core.setAttribute('viewBox', '0 0 100 100');
  core.setAttribute('width', String(coreSize));
  core.setAttribute('height', String(coreSize));

  const defs = document.createElementNS(SVG_NS, 'defs');
  const bodyGradient = document.createElementNS(SVG_NS, 'radialGradient');
  bodyGradient.setAttribute('id', 'tomato-body-gradient');
  bodyGradient.setAttribute('cx', '38%');
  bodyGradient.setAttribute('cy', '35%');
  bodyGradient.setAttribute('r', '75%');
  bodyGradient.innerHTML =
    '<stop offset="0%" stop-color="#ff8a6b"/>' +
    '<stop offset="45%" stop-color="#eb4a2f"/>' +
    '<stop offset="100%" stop-color="#b8301c"/>';
  const leafGradient = document.createElementNS(SVG_NS, 'radialGradient');
  leafGradient.setAttribute('id', 'tomato-leaf-gradient');
  leafGradient.setAttribute('cx', '35%');
  leafGradient.setAttribute('cy', '30%');
  leafGradient.setAttribute('r', '80%');
  leafGradient.innerHTML =
    '<stop offset="0%" stop-color="#a8d96b"/>' +
    '<stop offset="100%" stop-color="#5f9a3a"/>';
  defs.append(bodyGradient, leafGradient);

  const body = document.createElementNS(SVG_NS, 'circle');
  body.setAttribute('cx', '50');
  body.setAttribute('cy', '58');
  body.setAttribute('r', '36');
  body.setAttribute('fill', 'url(#tomato-body-gradient)');
  body.setAttribute('stroke', '#8f2415');
  body.setAttribute('stroke-width', '1.5');

  const calyx = document.createElementNS(SVG_NS, 'path');
  calyx.setAttribute('d', TOMATO_CALYX_PATH);
  calyx.setAttribute('fill', 'url(#tomato-leaf-gradient)');
  calyx.setAttribute('stroke', '#3f6b23');
  calyx.setAttribute('stroke-width', '1');

  const stem = document.createElementNS(SVG_NS, 'rect');
  stem.setAttribute('x', '47.5');
  stem.setAttribute('y', '22');
  stem.setAttribute('width', '5');
  stem.setAttribute('height', '10');
  stem.setAttribute('rx', '2.5');
  stem.setAttribute('fill', '#5f9a3a');

  const shine = document.createElementNS(SVG_NS, 'ellipse');
  shine.setAttribute('cx', '36');
  shine.setAttribute('cy', '46');
  shine.setAttribute('rx', '10');
  shine.setAttribute('ry', '6');
  shine.setAttribute('fill', '#ffffff');
  shine.setAttribute('opacity', '0.4');
  shine.setAttribute('transform', 'rotate(-25 36 46)');

  core.append(defs, body, calyx, stem, shine);

  wrap.append(halo, core);
  document.body.appendChild(wrap);
  return { wrap, halo, core };
}

function spawnTrailDot(x, y, t, size) {
  const dot = document.createElement('span');
  dot.className = 'nav-tomato__trail';
  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;
  dot.style.width = dot.style.height = `${size}px`;
  const color = trailColor(t);
  dot.style.background = color;
  dot.style.boxShadow = `0 0 ${10 * TOMATO_FX.TOMATO_GLOW}px 3px ${color}`;
  document.body.appendChild(dot);
  fadeAndRemove(dot, [
    { transform: 'translate(-50%, -50%) scale(1)', opacity: 0.9 },
    { transform: 'translate(-50%, -50%) scale(0.15)', opacity: 0 },
  ], 380, 'ease-out');
}

function spawnImpactFlash(x, y) {
  const flash = document.createElement('div');
  flash.className = 'nav-tomato__flash';
  flash.style.setProperty('--fx', `${x}px`);
  flash.style.setProperty('--fy', `${y}px`);
  document.body.appendChild(flash);
  fadeAndRemove(flash, [
    { opacity: Math.min(1, 0.95 * TOMATO_FX.IMPACT_POWER) },
    { opacity: 0 },
  ], 220, 'ease-out');
}

function spawnShockRing(x, y, { size, duration, bright = false }) {
  const ring = document.createElement('span');
  ring.className = bright ? 'nav-tomato__ring nav-tomato__ring--bright' : 'nav-tomato__ring';
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  ring.style.setProperty('--glow', TOMATO_FX.SHOCKWAVE_GLOW);
  document.body.appendChild(ring);
  fadeAndRemove(ring, [
    { width: '10px', height: '10px', opacity: 1 },
    { width: `${size}px`, height: `${size}px`, opacity: 0 },
  ], duration, 'cubic-bezier(0.16, 1, 0.3, 1)');
}

function spawnDistortionRing(x, y) {
  const ring = document.createElement('span');
  ring.className = 'nav-tomato__distortion';
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  ring.style.setProperty('--blur', `${3 + 6 * TOMATO_FX.DISTORTION_AMOUNT}px`);
  document.body.appendChild(ring);
  const maxSize = 460 * TOMATO_FX.SHOCKWAVE_SIZE;
  fadeAndRemove(ring, [
    { width: '20px', height: '20px', opacity: 0.85 },
    { width: `${maxSize}px`, height: `${maxSize}px`, opacity: 0 },
  ], 720 / TOMATO_FX.SHOCKWAVE_SPEED, 'cubic-bezier(0.16, 1, 0.3, 1)');
}

function spawnImpactParticles(x, y) {
  const palette = ['#d6432b', '#ff6b4a', '#ffe08a', '#8bc34a'];
  const count = TOMATO_FX.PARTICLE_COUNT;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
    const distance = (50 + Math.random() * 90) * TOMATO_FX.IMPACT_POWER;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const size = 3 + Math.random() * 3.5;

    const particle = document.createElement('span');
    particle.className = 'nav-tomato__particle';
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    const color = palette[i % palette.length];
    particle.style.background = color;
    particle.style.boxShadow = `0 0 6px 1px ${color}`;
    document.body.appendChild(particle);

    fadeAndRemove(particle, [
      { transform: 'translate(-50%, -50%) translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(0.25)`, opacity: 0 },
    ], (600 + Math.random() * 250) / TOMATO_FX.SHOCKWAVE_SPEED, 'cubic-bezier(0.16, 1, 0.3, 1)');
  }
}

function screenShake(amount) {
  if (amount <= 0) return;
  const steps = 6;
  const keyframes = [];
  for (let i = 0; i <= steps; i++) {
    const decay = 1 - i / steps;
    const dx = (Math.random() - 0.5) * 2 * amount * decay;
    const dy = (Math.random() - 0.5) * 2 * amount * decay;
    keyframes.push({ transform: `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px)` });
  }
  keyframes.push({ transform: 'translate(0, 0)' });
  document.body.animate(keyframes, { duration: 260, easing: 'ease-out' });
}

function SplatTransition({ origin, target, originScreen, reveal, onComplete }) {
  const originRect = origin.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  const start = { x: originRect.left + originRect.width / 2, y: originRect.top + originRect.height / 2 };
  const impact = { x: targetRect.left + targetRect.width / 2, y: targetRect.top + targetRect.height / 2 };

  if (reduceMotion) {
    originScreen.hidden = true;
    reveal.hidden = false;
    window.scrollTo(0, 0);
    if (onComplete) onComplete();
    return;
  }

  // L'écran d'origine devient une surcouche plein écran, prête à être
  // percée par le portail. Le contenu suivant est révélé dessous
  // immédiatement (invisible tant que le rayon du portail est à 0).
  originScreen.classList.add('hero--leaving', 'hero--portal');
  originScreen.style.setProperty('--portal-r', '0px');
  originScreen.style.setProperty('--portal-x', `${impact.x}px`);
  originScreen.style.setProperty('--portal-y', `${impact.y}px`);
  reveal.hidden = false;

  // Trajectoire légèrement courbe, avec un arc vers le haut pour un mouvement cinématique.
  const dx = impact.x - start.x;
  const dy = impact.y - start.y;
  const dist = Math.hypot(dx, dy) || 1;
  const nx = -dy / dist;
  const ny = dx / dist;
  const bowSign = nx >= 0 ? 1 : -1;
  const control = {
    x: (start.x + impact.x) / 2 + nx * dist * 0.2 * bowSign,
    y: (start.y + impact.y) / 2 + ny * dist * 0.2 * bowSign - dist * 0.12,
  };

  const { wrap: tomato, halo, core } = createTomatoElement();
  tomato.style.transform = `translate(${start.x}px, ${start.y}px) translate(-50%, -50%) scale(0.001)`;

  const APPEAR_MS = 120;
  const IDLE_MS = 380;
  const TRAVEL_MS = 650 / TOMATO_FX.TOMATO_SPEED;

  function setTomatoTransform(pos, angleDeg, scale, stretch) {
    tomato.style.transform =
      `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%) rotate(${angleDeg}deg) scale(${scale * stretch}, ${scale})`;
  }

  // --- Étape 1 : apparition ---
  function appearStage(now, t0) {
    const t = Math.min(1, (now - t0) / APPEAR_MS);
    const scale = 0.15 + 0.35 * t;
    setTomatoTransform(start, 0, scale, 1);
    halo.style.opacity = String(0.3 * t);
    core.style.opacity = String(t);
    if (t < 1) {
      requestAnimationFrame((n) => appearStage(n, t0));
    } else {
      requestAnimationFrame((n) => idleStage(n, n));
    }
  }

  // --- Étape 2 : pulsation légère + montée en puissance du glow ---
  function idleStage(now, t0) {
    const elapsed = now - t0;
    const t = Math.min(1, elapsed / IDLE_MS);
    const pulse = Math.sin(t * Math.PI * 2.4) * 0.06;
    const scale = 0.5 + 0.15 * easeOutQuart(t) + pulse;
    setTomatoTransform(start, t * 40, scale, 1);
    halo.style.opacity = String(0.3 + 0.7 * easeOutQuart(t));
    if (t < 1) {
      requestAnimationFrame((n) => idleStage(n, t0));
    } else {
      requestAnimationFrame((n) => travelStage(n, n));
    }
  }

  // --- Étape 3 : vol — accélération -> vitesse max -> énorme accélération finale ---
  let lastTrailTime = -Infinity;

  function travelProgress(t) {
    if (t < 0.45) return 0.3 * easeInCubic(t / 0.45);
    if (t < 0.8) {
      const local = (t - 0.45) / 0.35;
      return 0.3 + 0.45 * local;
    }
    const local = (t - 0.8) / 0.2;
    return 0.75 + 0.25 * easeInExpo(local);
  }

  function travelStage(now, t0) {
    const elapsed = now - t0;
    const t = Math.min(1, elapsed / TRAVEL_MS);
    const p = travelProgress(t);
    const pos = quadBezier(start, control, impact, p);
    const ahead = quadBezier(start, control, impact, Math.min(1, p + 0.01));
    const angle = Math.atan2(ahead.y - pos.y, ahead.x - pos.x) * (180 / Math.PI) + t * 180;

    const speedT = Math.min(1, t / 0.85);
    const scale = 0.65 + 0.6 * speedT;
    const stretch = 1 + 2.6 * Math.pow(speedT, 2);
    const blur = 1 + 11 * Math.pow(speedT, 3);

    setTomatoTransform(pos, angle, scale, stretch);
    tomato.style.filter = `blur(${blur.toFixed(1)}px)`;
    halo.style.opacity = String(0.85 + 0.15 * speedT);

    if (elapsed - lastTrailTime > 18 && t > 0.05) {
      spawnTrailDot(pos.x, pos.y, t, (8 + 10 * speedT) * TOMATO_FX.TOMATO_GLOW);
      lastTrailTime = elapsed;
    }

    if (t < 1) {
      requestAnimationFrame((n) => travelStage(n, t0));
    } else {
      // La tomate s'écrase sur l'avatar : brièvement compressée dans l'axe de
      // l'impact, mais sa silhouette reste reconnaissable avant de s'effacer.
      const squashAngle = Math.atan2(impact.y - control.y, impact.x - control.x) * (180 / Math.PI);
      const anim = tomato.animate([
        { transform: `translate(${impact.x}px, ${impact.y}px) translate(-50%, -50%) rotate(${squashAngle}deg) scale(1.5, 0.55)`, filter: 'blur(2px)', opacity: 1 },
        { transform: `translate(${impact.x}px, ${impact.y}px) translate(-50%, -50%) rotate(${squashAngle}deg) scale(0.7, 0.7)`, filter: 'blur(0px)', opacity: 0 },
      ], { duration: 130, easing: 'ease-out', fill: 'forwards' });
      anim.addEventListener('finish', () => tomato.remove());
      impactStage();
    }
  }

  // --- Étape 4 : IMPACT ---
  function impactStage() {
    screenShake(7 * TOMATO_FX.SCREEN_SHAKE);
    spawnImpactFlash(impact.x, impact.y);

    target.style.setProperty('--impact-power', TOMATO_FX.IMPACT_POWER);
    target.classList.add('hero-avatar--impact');
    target.addEventListener('animationend', () => {
      target.classList.remove('hero-avatar--impact');
    }, { once: true });

    // Onde 1 (~0.05s) : flash minuscule et extrêmement lumineux, exactement au point d'impact.
    window.setTimeout(() => {
      spawnShockRing(impact.x, impact.y, {
        size: 70 * TOMATO_FX.SHOCKWAVE_SIZE,
        duration: 220 / TOMATO_FX.SHOCKWAVE_SPEED,
        bright: true,
      });
    }, 20);

    // Onde 2 (~0.08s) : cercle d'énergie qui se propage autour de l'avatar.
    window.setTimeout(() => {
      spawnShockRing(impact.x, impact.y, {
        size: 380 * TOMATO_FX.SHOCKWAVE_SIZE,
        duration: 480 / TOMATO_FX.SHOCKWAVE_SPEED,
      });
      spawnImpactParticles(impact.x, impact.y);
    }, 50);

    // Onde 3 (~0.1s) : distorsion qui traverse l'image.
    window.setTimeout(() => spawnDistortionRing(impact.x, impact.y), 70);

    // ~0.15s : l'onde principale se développe et devient la transition.
    window.setTimeout(growPortal, 120);
  }

  // --- Étape 5 : le portail — l'onde continue de grandir jusqu'à recouvrir l'écran ---
  function growPortal() {
    const corners = [
      { x: 0, y: 0 },
      { x: window.innerWidth, y: 0 },
      { x: 0, y: window.innerHeight },
      { x: window.innerWidth, y: window.innerHeight },
    ];
    const maxRadius = Math.max(...corners.map(c => Math.hypot(c.x - impact.x, c.y - impact.y))) * 1.05;
    const PORTAL_MS = 720 * TOMATO_FX.TRANSITION_DURATION;

    const rim = document.createElement('span');
    rim.className = 'nav-tomato__rim';
    rim.style.left = `${impact.x}px`;
    rim.style.top = `${impact.y}px`;
    rim.style.setProperty('--glow', TOMATO_FX.SHOCKWAVE_GLOW);
    document.body.appendChild(rim);

    let portalT0 = null;

    function portalFrame(now) {
      if (portalT0 === null) portalT0 = now;
      const elapsed = now - portalT0;
      const t = Math.min(1, elapsed / PORTAL_MS);
      const radius = maxRadius * easeOutQuart(t);
      originScreen.style.setProperty('--portal-r', `${radius}px`);
      rim.style.width = rim.style.height = `${radius * 2}px`;
      rim.style.opacity = t < 0.75 ? '1' : String(1 - (t - 0.75) / 0.25);

      if (t < 1) {
        requestAnimationFrame(portalFrame);
      } else {
        rim.remove();
        finish();
      }
    }

    requestAnimationFrame(portalFrame);
  }

  function finish() {
    originScreen.hidden = true;
    originScreen.classList.remove('hero--leaving', 'hero--portal');
    originScreen.style.removeProperty('--portal-r');
    originScreen.style.removeProperty('--portal-x');
    originScreen.style.removeProperty('--portal-y');
    window.scrollTo(0, 0);
    if (onComplete) onComplete();
  }

  requestAnimationFrame((n) => appearStage(n, n));
}

// Écran-titre : "Commencez" déclenche la SplatTransition vers le reste du portfolio.
const startButton = document.getElementById('start-game');
const gameContent = document.getElementById('game-content');
const hero = document.querySelector('.hero');
const heroAvatar = document.querySelector('.hero-avatar');

if (startButton && gameContent && hero && heroAvatar) {
  startButton.addEventListener('click', () => {
    startButton.disabled = true;
    SplatTransition({
      origin: startButton,
      target: heroAvatar,
      originScreen: hero,
      reveal: gameContent,
      onComplete: () => {
        startButton.disabled = false;
      },
    });
  });

  const initialHash = window.location.hash;
  if (initialHash && initialHash !== '#accueil') {
    hero.hidden = true;
    gameContent.hidden = false;
    const target = document.querySelector(initialHash);
    if (target) {
      requestAnimationFrame(() => target.scrollIntoView());
    }
  }

  // Écho au HUD "[ ENTRÉE ] ou clic" : la touche Entrée lance aussi la transition.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !hero.hidden && !startButton.disabled) {
      startButton.click();
    }
  });

  document.querySelectorAll('a[href="#accueil"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      gameContent.hidden = true;
      hero.hidden = false;
      hero.classList.remove('hero--leaving', 'hero--portal');
      hero.style.removeProperty('--portal-r');
      hero.style.removeProperty('--portal-x');
      hero.style.removeProperty('--portal-y');
      heroAvatar.classList.remove('hero-avatar--impact');
      window.scrollTo(0, 0);
    });
  });
}

// ============================================================
// CTA "Voir le projet" — bouton premium (séquence de clic).
// ============================================================
document.querySelectorAll('.cta-stage').forEach(stage => {
  const btn = stage.querySelector('.cta-btn');
  const label = stage.querySelector('.cta-btn__label');
  const href = stage.dataset.href;
  if (!btn || !label || !href) return;

  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    btn.disabled = true;
    btn.classList.add('is-loading', 'cta-flash');
    label.textContent = 'Chargement…';

    window.setTimeout(() => btn.classList.remove('cta-flash'), 320);

    window.setTimeout(() => {
      window.location.href = href;
    }, 700);
  });
});

// Révélation progressive des cartes projets ("recette débloquée")
const revealCards = document.querySelectorAll('.project-card');

if (revealCards.length) {
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealCards.forEach(card => card.classList.add('is-visible'));
  } else {
    const cardObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealCards.forEach(card => cardObserver.observe(card));
  }
}

// Parallaxe léger du portrait sur l'écran-titre
if (hero && !reduceMotion) {
  let frame = null;

  hero.addEventListener('mousemove', (e) => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      const rect = hero.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width - 0.5;
      const my = (e.clientY - rect.top) / rect.height - 0.5;
      hero.style.setProperty('--mx', mx.toFixed(3));
      hero.style.setProperty('--my', my.toFixed(3));
      frame = null;
    });
  });
}
