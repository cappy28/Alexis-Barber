// ===== Loader =====
let hexStart = () => {};
addEventListener('load', () => setTimeout(() => {
  document.body.classList.add('loaded');
  hexStart();
}, 1500));

// ===== Nav & bouton flottant =====
const nav = document.getElementById('nav'), fab = document.getElementById('fab');
const onScroll = () => {
  nav.classList.toggle('scrolled', scrollY > 40);
  fab.classList.toggle('show', scrollY > 900);
};
addEventListener('scroll', onScroll, { passive: true }); onScroll();

// ===== Menu mobile =====
const burger = document.getElementById('burger'), links = document.getElementById('links');
const closeMenu = () => { burger.classList.remove('open'); links.classList.remove('open'); document.body.style.overflow = ''; };
burger.addEventListener('click', () => {
  const open = !links.classList.contains('open');
  burger.classList.toggle('open', open); links.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
});
links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

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
}), { threshold: .15 });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

// ===== Plafond hexagonal lumineux (comme au salon) =====
(() => {
  const cv = document.getElementById('hex'); if (!cv) return;
  const ctx = cv.getContext('2d'), hero = document.getElementById('top');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, R = 50, cells = [], mx = -9999, my = -9999, start = 0, raf = null, visible = true, started = false;
  let ACC = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim() || '255,255,255';

  function build() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = W < 700 ? 34 : 52;
    const w = Math.sqrt(3) * R, h = 1.5 * R, diag = Math.hypot(W, H);
    cells = [];
    for (let row = -1; row * h < H + R; row++) {
      for (let col = -1; col * w < W + w; col++) {
        const x = col * w + (row % 2 ? w / 2 : 0), y = row * h;
        // s'allument depuis le centre vers les bords, avec un peu de hasard
        cells.push({ x, y, d: Math.hypot(x - W / 2, y - H / 2) / diag * 1600 + Math.random() * 700, p: Math.random() * 6.28 });
      }
    }
  }
  function hexPath(x, y, r) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 180 * (60 * i - 30);
      const px = x + r * Math.cos(a), py = y + r * Math.sin(a);
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
  }
  function draw(now) {
    const t = now - start;
    ctx.clearRect(0, 0, W, H);
    for (const c of cells) {
      let on = reduce ? 1 : Math.min(Math.max((t - c.d) / 350, 0), 1);
      if (on <= 0) continue;
      if (on < 1 && Math.random() < .35) on *= .2;            // grésillement à l'allumage
      const near = Math.max(0, 1 - Math.hypot(c.x - mx, c.y - my) / 240);
      const a = on * (.24 + .08 * Math.sin(now / 1600 + c.p)) + near * .75;
      hexPath(c.x, c.y, R * .86);
      ctx.lineWidth = 10; ctx.strokeStyle = `rgba(${near > 0 ? ACC : '255,255,255'},${(a * .16).toFixed(3)})`; ctx.stroke();
      ctx.lineWidth = 2.2; ctx.strokeStyle = `rgba(255,255,255,${Math.min(a * 1.3, 1).toFixed(3)})`; ctx.stroke();
    }
    raf = (!reduce && visible) ? requestAnimationFrame(draw) : null;
  }
  const run = () => { if (!raf) raf = requestAnimationFrame(draw); };

  build();
  hexStart = () => { if (started) return; started = true; start = performance.now(); run(); };
  setTimeout(hexStart, 4200); // sécurité si le load tarde

  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); if (started) run(); }, 150); });
  hero.addEventListener('pointermove', e => {
    const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top;
    if (reduce && started) requestAnimationFrame(draw);
  });
  hero.addEventListener('pointerleave', () => { mx = my = -9999; });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && started) run(); }).observe(hero);
})();

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

// ===== Lightbox galerie =====
const lb = document.getElementById('lightbox'), lbImg = lb.querySelector('img');
let idx = 0;
const gImgs = () => [...document.querySelectorAll('.g img')];
const show = i => {
  const list = gImgs(); if (!list.length) return;
  idx = (i + list.length) % list.length;
  lbImg.src = list[idx].src; lb.classList.add('open');
};
document.querySelectorAll('.g').forEach(g => g.addEventListener('click', () => {
  const im = g.querySelector('img'); if (im) show(gImgs().indexOf(im));
}));
const closeLb = () => lb.classList.remove('open');
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

document.getElementById('y').textContent = new Date().getFullYear();
