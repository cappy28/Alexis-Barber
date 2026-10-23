// ================== ALEXIS BARBER · script.js ==================
const root = document.documentElement;
const PASSWORD = 'Alexis-site-code-barber';

// ===== Lancement (loader + plafond hexagonal) =====
let launched = false;
function launch(delay = 0) {
  if (launched) return; launched = true;
  setTimeout(() => { document.body.classList.add('loaded'); initHex(); }, delay);
}
if (!root.classList.contains('locked')) {
  addEventListener('load', () => launch(1500));
  setTimeout(() => launch(0), 4000); // sécurité
}

// ===== Écran mot de passe =====
(() => {
  const gate = document.getElementById('gate'); if (!gate) return;
  if (!root.classList.contains('locked')) { gate.remove(); return; }
  const form = document.getElementById('gateForm'), input = document.getElementById('gatePass'),
        err = document.getElementById('gateErr'), eye = document.getElementById('gateEye');

  if (matchMedia('(hover:hover)').matches) setTimeout(() => input.focus(), 400); // pas de clavier forcé sur mobile

  eye.addEventListener('click', () => {
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    eye.classList.toggle('on', show);
    eye.setAttribute('aria-label', show ? 'Masquer le mot de passe' : 'Afficher le mot de passe');
  });
  input.addEventListener('input', () => { err.textContent = ''; });

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (input.value.trim() === PASSWORD) {
      try { localStorage.setItem('ab-access', 'ok'); } catch (_) {}
      input.blur();
      document.body.classList.add('loaded');
      gate.classList.add('leaving');
      root.classList.remove('locked');
      window.scrollTo({ top: 0, behavior: 'instant' });
      launch(0);
      setTimeout(() => gate.remove(), 900);
    } else {
      err.textContent = 'Mot de passe incorrect';
      form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
      input.select();
      if (navigator.vibrate) navigator.vibrate(120);
    }
  });
})();

// ===== Nav & bouton flottant =====
const nav = document.getElementById('nav'), fab = document.getElementById('fab');
const onScroll = () => {
  nav.classList.toggle('scrolled', scrollY > 40);
  fab.classList.toggle('show', scrollY > 900);
};
addEventListener('scroll', onScroll, { passive: true }); onScroll();

// ===== Menu mobile =====
const burger = document.getElementById('burger'), links = document.getElementById('links');
const setMenu = open => {
  burger.classList.toggle('open', open);
  links.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  document.body.style.overflow = open ? 'hidden' : '';
};
burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('resize', () => { if (innerWidth > 1050) setMenu(false); });

// ===== Apparition au scroll + compteurs =====
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  e.target.querySelectorAll('[data-count]').forEach(el => {
    const target = +el.dataset.count, dec = +(el.dataset.dec || 0), t0 = performance.now();
    const step = now => {
      const p = Math.min((now - t0) / 1800, 1), v = target * (1 - Math.pow(1 - p, 4));
      el.textContent = v.toFixed(dec).replace('.', ',');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  io.unobserve(e.target);
}), { threshold: .12 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

// ===== Plafond hexagonal lumineux =====
function initHex() {
  const cv = document.getElementById('hex');
  if (!cv || cv.dataset.on) return; cv.dataset.on = '1';
  const ctx = cv.getContext('2d'), hero = document.getElementById('top');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = !matchMedia('(hover:hover)').matches;
  const ACC = getComputedStyle(root).getPropertyValue('--accent-rgb').trim() || '255,255,255';
  let W = 0, H = 0, R = 50, cells = [], mx = -9999, my = -9999, raf = null, visible = true;
  const start = performance.now();

  function build() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = W < 700 ? 30 : 52;
    const w = Math.sqrt(3) * R, h = 1.5 * R, diag = Math.hypot(W, H);
    cells = [];
    for (let row = -1; row * h < H + R; row++) {
      for (let col = -1; col * w < W + w; col++) {
        const x = col * w + (row % 2 ? w / 2 : 0), y = row * h;
        cells.push({ x, y, d: Math.hypot(x - W / 2, y - H / 2) / diag * 1600 + Math.random() * 700, p: Math.random() * 6.28 });
      }
    }
  }
  function hexPath(x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 180 * (60 * i - 30);
      i ? ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a)) : ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a));
    }
    ctx.closePath();
  }
  function draw(now) {
    const t = now - start;
    // Sur téléphone (pas de souris), une lumière se balade toute seule
    if (touch && !reduce) { mx = W / 2 + W * .42 * Math.sin(now / 2600); my = H / 2 + H * .38 * Math.sin(now / 1700); }
    ctx.clearRect(0, 0, W, H);
    for (const c of cells) {
      let on = reduce ? 1 : Math.min(Math.max((t - c.d) / 350, 0), 1);
      if (on <= 0) continue;
      if (on < 1 && Math.random() < .35) on *= .2; // grésillement à l'allumage
      const near = Math.max(0, 1 - Math.hypot(c.x - mx, c.y - my) / (touch ? 180 : 240));
      const a = on * (.24 + .08 * Math.sin(now / 1600 + c.p)) + near * .75;
      hexPath(c.x, c.y, R * .86);
      ctx.lineWidth = 10; ctx.strokeStyle = `rgba(${near > 0 ? ACC : '255,255,255'},${(a * .16).toFixed(3)})`; ctx.stroke();
      ctx.lineWidth = 2.2; ctx.strokeStyle = `rgba(255,255,255,${Math.min(a * 1.3, 1).toFixed(3)})`; ctx.stroke();
    }
    raf = (!reduce && visible) ? requestAnimationFrame(draw) : null;
  }
  const run = () => { if (!raf && visible) raf = requestAnimationFrame(draw); };

  build(); run();

  let rt;
  addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => { if (cv.clientWidth !== W || cv.clientHeight !== H) { build(); run(); } }, 200);
  });
  if (!touch) {
    hero.addEventListener('pointermove', e => {
      const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
      if (reduce) requestAnimationFrame(draw);
    });
    hero.addEventListener('pointerleave', () => { mx = my = -9999; });
  }
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) run(); }).observe(hero);
}

// ===== Horaires + néon Ouvert/Fermé =====
const HOURS = { 0: null, 1: [10, 20], 2: [10, 20], 3: [10, 20], 4: [10, 20], 5: [10, 23], 6: [10, 20] };
const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const now = new Date(), d = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
const ul = document.getElementById('hours');
[1, 2, 3, 4, 5, 6, 0].forEach(i => {
  const li = document.createElement('li');
  if (i === d) li.className = 'today';
  li.innerHTML = `<span>${DAYS[i]}</span><span>${HOURS[i] ? `${HOURS[i][0]}h – ${HOURS[i][1]}h` : 'Fermé'}</span>`;
  ul.appendChild(li);
});
const neon = document.getElementById('neon'), neonSub = document.getElementById('neonSub');
if (HOURS[d] && h >= HOURS[d][0] && h < HOURS[d][1]) {
  neon.textContent = 'Ouvert';
  neonSub.textContent = `Jusqu'à ${HOURS[d][1]}h aujourd'hui`;
} else {
  neon.textContent = 'Fermé'; neon.classList.add('off');
  for (let k = 0; k < 8; k++) {
    const day = (d + k) % 7;
    if (HOURS[day] && (k > 0 || h < HOURS[day][0])) {
      const when = k === 0 ? "aujourd'hui" : k === 1 ? 'demain' : DAYS[day].toLowerCase();
      neonSub.textContent = `Réouverture ${when} à ${HOURS[day][0]}h`; break;
    }
  }
}

// ===== Lightbox galerie (+ glisser du doigt sur mobile) =====
const lb = document.getElementById('lightbox'), lbImg = lb.querySelector('img');
let idx = 0;
const gImgs = () => [...document.querySelectorAll('.g img')];
const show = i => {
  const list = gImgs(); if (!list.length) return;
  idx = (i + list.length) % list.length;
  lbImg.src = list[idx].src;
  lb.classList.add('open'); document.body.style.overflow = 'hidden';
};
const closeLb = () => { lb.classList.remove('open'); document.body.style.overflow = ''; };
document.querySelectorAll('.g').forEach(g => g.addEventListener('click', () => {
  const im = g.querySelector('img'); if (im) show(gImgs().indexOf(im));
}));
lb.querySelector('.lb-close').onclick = closeLb;
lb.querySelector('.lb-prev').onclick = e => { e.stopPropagation(); show(idx - 1); };
lb.querySelector('.lb-next').onclick = e => { e.stopPropagation(); show(idx + 1); };
lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
addEventListener('keydown', e => {
  if (!lb.classList.contains('open')) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowRight') show(idx + 1);
  if (e.key === 'ArrowLeft') show(idx - 1);
});
let sx = 0;
lb.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - sx;
  if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
}, { passive: true });

document.getElementById('y').textContent = new Date().getFullYear();

/* =========================================================
   V5 : CHOIX DU SALON · BARRE MOBILE · PROGRESSION · MENU ACTIF
   ========================================================= */

/* ----- Barre de progression LED ----- */
.progress{position:fixed;top:0;left:0;right:0;height:2px;z-index:150;pointer-events:none;
  transform-origin:0 50%;transform:scaleX(0);background:#fff;
  box-shadow:0 0 6px #fff,0 0 14px rgba(255,255,255,.7)}

/* ----- Menu : section active soulignée ----- */
.links a:not(.btn){position:relative}
.links a:not(.btn)::after{content:"";position:absolute;left:0;right:0;bottom:-8px;height:2px;border-radius:2px;
  background:#fff;box-shadow:0 0 8px #fff,0 0 16px rgba(255,255,255,.6);transform:scaleX(0);transition:transform .45s var(--ease)}
.links a.active{color:#fff}
.links a.active::after{transform:scaleX(1)}

/* ----- Panneau "Dans quel salon ?" ----- */
.sheet{position:fixed;inset:0;z-index:600;visibility:hidden;pointer-events:none;transition:visibility 0s .5s}
.sheet.open{visibility:visible;pointer-events:auto;transition-delay:0s}
.sheet-bg{position:absolute;inset:0;background:rgba(0,0,0,.72);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transition:opacity .4s var(--ease)}
.sheet.open .sheet-bg{opacity:1}
.sheet-panel{position:absolute;left:50%;top:50%;width:min(480px,92vw);padding:42px 32px 28px;border-radius:26px;
  background:#0b0b0b;border:1px solid #222;box-shadow:0 40px 100px #000;
  opacity:0;transform:translate(-50%,-46%) scale(.96);transition:transform .5s var(--ease),opacity .4s var(--ease)}
.sheet-panel::before{content:"";position:absolute;inset:5px;border-radius:21px;border:2px solid #fff;box-shadow:var(--led);opacity:.9;pointer-events:none}
.sheet.open .sheet-panel{opacity:1;transform:translate(-50%,-50%)}
.sheet h3{font-weight:900;font-size:1.7rem;line-height:1.1;text-transform:uppercase;letter-spacing:-.01em;margin:10px 0 22px}
.sheet-list{display:grid;gap:12px;position:relative;z-index:1}
.pick{display:flex;align-items:center;gap:16px;padding:18px 20px;border-radius:18px;background:#121212;border:1px solid #262626;transition:border-color .3s,box-shadow .3s}
.pick:hover,.pick:focus-visible{border-color:#fff;box-shadow:var(--led);outline:none}
.pick:active{transform:scale(.98)}
.pick-num{width:44px;height:44px;flex:none;border-radius:50%;display:grid;place-items:center;border:2px solid #fff;font-weight:900;font-size:.85rem;box-shadow:0 0 8px rgba(255,255,255,.5),inset 0 0 6px rgba(255,255,255,.3)}
.pick-txt{flex:1;display:flex;flex-direction:column;line-height:1.35;min-width:0}
.pick-txt b{font-weight:800;text-transform:uppercase;letter-spacing:.05em}
.pick-txt small{color:var(--muted);font-size:.78rem}
.pick-go{font-size:1.3rem;transition:transform .3s var(--ease)}
.pick:hover .pick-go{transform:translateX(5px)}
.sheet-grip{display:none;width:44px;height:5px;border-radius:3px;background:#3a3a3a;margin:0 auto 20px}
.sheet-x{position:absolute;top:18px;right:18px;z-index:2;width:40px;height:40px;border-radius:50%;background:none;border:1px solid #333;color:#fff;cursor:pointer;transition:.3s}
.sheet-x:hover{border-color:#fff;box-shadow:var(--led)}
.sheet-note{margin-top:20px;text-align:center;font-size:.64rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:#5a5a5a}

/* ----- Compteur galerie ----- */
.lb-count{position:absolute;top:34px;left:50%;transform:translateX(-50%);font-size:.72rem;font-weight:700;letter-spacing:.3em;color:#9a9a9a}

/* ----- Barre d'actions mobile ----- */
.dock{display:none}

@media (max-width:640px){
  .fab{display:none}
  .dock{display:grid;grid-template-columns:1fr 1.5fr 1fr;align-items:center;gap:4px;
    position:fixed;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));z-index:95;
    padding:6px;border-radius:999px;background:rgba(12,12,12,.9);
    backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
    border:1px solid #2a2a2a;box-shadow:0 18px 40px rgba(0,0,0,.65);
    transform:translateY(170%);transition:transform .55s var(--ease)}
  .dock.show{transform:none}
  .dock a{display:flex;flex-direction:column;align-items:center;gap:3px;padding:7px 0;font-size:.56rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#cfcfcf}
  .dock a:active{color:#fff}
  .dock svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
  .dock .dock-main{flex-direction:row;justify-content:center;gap:8px;padding:15px 0;border-radius:999px;font-size:.72rem;letter-spacing:.16em;color:#111;
    background:linear-gradient(180deg,var(--accent-2),var(--accent) 50%,var(--accent-3));box-shadow:0 0 16px rgba(var(--accent-rgb),.4),inset 0 1px 0 rgba(255,255,255,.6)}
  footer{padding-bottom:calc(110px + env(safe-area-inset-bottom))}

  /* Le panneau devient une "bottom sheet" */
  .sheet-panel{left:0;right:0;top:auto;bottom:0;width:auto;opacity:1;border-radius:26px 26px 0 0;
    padding:12px 18px calc(24px + env(safe-area-inset-bottom));transform:translateY(105%)}
  .sheet-panel::before{border-radius:21px 21px 0 0;bottom:-10px}
  .sheet.open .sheet-panel{transform:none}
  .sheet-grip{display:block}
  .sheet-x{display:none}
  .sheet h3{font-size:1.45rem;margin-bottom:18px}
  .pick{padding:16px}
  .lb-count{top:28px}
}
