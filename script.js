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
const HOURS = { 0: null, 1: [10, 20], 2: [10, 20], 3: [10, 20], 4: [10, 20], 5: [10, 20], 6: [10, 20] };
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

// ================== V5 : améliorations ==================

// ----- Les deux salons (👉 modifier ici si une info change) -----
const SHOPS = [
  { num: 'I',  name: 'Saint-Aubert', addr: '70 Rue Saint-Aubert, 62000 Arras', note: '★ 4,9', book: 'https://www.planity.com/alexis-barber-62000-arras' },
  { num: 'II', name: 'Gambetta',     addr: '62 Rue Gambetta, 62000 Arras',     note: '★ 5,0', book: 'https://www.planity.com/alexis-barber-2-62000-arras' }
];

// ----- Panneau "Dans quel salon ?" -----
(() => {
  const sheet = document.getElementById('sheet'); if (!sheet) return;
  const panel = sheet.querySelector('.sheet-panel'), list = document.getElementById('sheetList'),
        title = document.getElementById('sheetTitle'), note = document.getElementById('sheetNote');
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const mapUrl = a => isIOS
    ? `https://maps.apple.com/?daddr=${encodeURIComponent(a)}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(a)}`;
  let lastFocus = null;

  const open = mode => {
    const book = mode === 'book';
    title.textContent = book ? 'Dans quel salon ?' : 'Quel salon rejoindre ?';
    note.textContent = book ? 'Réservation via Planity · confirmation immédiate' : "S'ouvre dans votre application de cartes";
    list.innerHTML = SHOPS.map(s => `
      <a class="pick" href="${book ? s.book : mapUrl(s.addr)}" target="_blank" rel="noopener">
        <span class="pick-num">${s.num}</span>
        <span class="pick-txt"><b>${s.name}</b><small>${s.addr}${book ? ' · ' + s.note : ''}</small></span>
        <span class="pick-go">→</span>
      </a>`).join('');
    lastFocus = document.activeElement;
    sheet.classList.add('open'); sheet.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (matchMedia('(hover:hover)').matches) setTimeout(() => list.querySelector('a')?.focus({ preventScroll: true }), 350);
  };
  const close = () => {
    sheet.classList.remove('open'); sheet.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    panel.style.transform = '';
    lastFocus?.focus?.({ preventScroll: true });
  };

  // Tous les boutons "Réserver" ouvrent le choix (sauf ceux des cartes salon, déjà précis)
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href*="planity.com"]');
    if (!a || a.closest('.shop, .sheet')) return;
    e.preventDefault(); open('book');
  });
  document.getElementById('dockMap')?.addEventListener('click', e => { e.preventDefault(); open('map'); });
  sheet.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) close();
    else if (e.target.closest('.pick')) setTimeout(close, 300);
  });
  addEventListener('keydown', e => { if (e.key === 'Escape' && sheet.classList.contains('open')) close(); });

  // Glisser vers le bas pour fermer (téléphone)
  const small = matchMedia('(max-width:640px)');
  let y0 = null, dy = 0;
  panel.addEventListener('touchstart', e => {
    if (!small.matches) return;
    y0 = e.touches[0].clientY; dy = 0; panel.style.transition = 'none';
  }, { passive: true });
  panel.addEventListener('touchmove', e => {
    if (y0 === null) return;
    dy = Math.max(0, e.touches[0].clientY - y0);
    panel.style.transform = `translateY(${dy}px)`;
  }, { passive: true });
  panel.addEventListener('touchend', () => {
    if (y0 === null) return;
    panel.style.transition = ''; y0 = null;
    if (dy > 90) close(); else panel.style.transform = '';
  });
})();

// ----- Barre de progression + barre mobile + menu actif -----
(() => {
  const dock = document.getElementById('dock'), bar = document.getElementById('progress');
  const tick = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(scrollY / max, 1) : 0})`;
    if (dock) dock.classList.toggle('show', scrollY > 500);
  };
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { tick(); ticking = false; });
  }, { passive: true });
  addEventListener('resize', tick); tick();

  const navLinks = [...document.querySelectorAll('.links a[href^="#"]')];
  const spy = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach(a => { const s = document.querySelector(a.getAttribute('href')); if (s) spy.observe(s); });
  const hero = document.getElementById('top'); if (hero) spy.observe(hero);
})();

// ----- Compteur dans la galerie plein écran -----
(() => {
  const box = document.getElementById('lightbox'); if (!box) return;
  const img = box.querySelector('img'), c = document.createElement('p');
  c.className = 'lb-count'; box.appendChild(c);
  const pad = n => String(n).padStart(2, '0');
  new MutationObserver(() => {
    const list = [...document.querySelectorAll('.g img')];
    const i = list.findIndex(x => x.src === img.src);
    c.textContent = i >= 0 ? `${pad(i + 1)} / ${pad(list.length)}` : '';
  }).observe(img, { attributes: true, attributeFilter: ['src'] });
})();

// ================== V6 : avis + réservation directe ==================

// ----- Les avis (👉 pour en ajouter un : copier une ligne et changer la note et le texte) -----
const REVIEWS = [
  { r: 4.8, t: "Très bien accueilli, c’était une première fois pour mon fils dans ce salon, et il est reparti plus que satisfait. Merci à son coiffeur en particulier qui a su être à l’écoute et faire ce qu’il voulait." },
  { r: 5,   t: "Je reviendrai, il n’y a pas photo : ce sont les meilleurs !" },
  { r: 5,   t: "Au top, comme d’hab !" },
  { r: 5,   t: "Ambiance super sympa, mon fils adore." },
  { r: 5,   t: "Coupe parfaite, salon très propre et très bonne ambiance. Je reconseille !" }
];

(() => {
  const track = document.getElementById('revTrack'), dots = document.getElementById('revDots');
  const prev = document.getElementById('revPrev'), next = document.getElementById('revNext');
  if (!track) return;
  const fr = n => String(n).replace('.', ',');

  track.innerHTML = REVIEWS.map((v, i) => `
    <article class="rev" aria-label="Avis ${i + 1} sur ${REVIEWS.length}">
      <div class="rev-top"><span class="rstars" style="--r:${v.r}" aria-label="${fr(v.r)} sur 5">★★★★★</span><b>${fr(v.r)}</b></div>
      <p>${v.t}</p>
      <span class="rev-src">Avis client · Planity</span>
    </article>`).join('');

  const cards = [...track.children];
  const gap = () => parseFloat(getComputedStyle(track).columnGap) || 0;
  const step = () => cards[0].getBoundingClientRect().width + gap();
  const visible = () => Math.max(1, Math.round((track.clientWidth + gap()) / step()));
  let pages = 0;

  const update = () => {
    const i = Math.round(track.scrollLeft / step());
    [...dots.children].forEach((b, k) => b.classList.toggle('on', k === i));
    if (prev) prev.disabled = track.scrollLeft < 5;
    if (next) next.disabled = track.scrollLeft > track.scrollWidth - track.clientWidth - 5;
  };
  const buildDots = () => {
    const p = Math.max(1, cards.length - visible() + 1);
    if (p !== pages) {
      pages = p;
      dots.innerHTML = p > 1 ? Array.from({ length: p }, (_, i) => `<button aria-label="Aller à l'avis ${i + 1}"></button>`).join('') : '';
      [...dots.children].forEach((b, i) => b.addEventListener('click', () => track.scrollTo({ left: i * step() })));
    }
    update();
  };

  prev?.addEventListener('click', () => track.scrollBy({ left: -step() }));
  next?.addEventListener('click', () => track.scrollBy({ left: step() }));
  let t; track.addEventListener('scroll', () => { cancelAnimationFrame(t); t = requestAnimationFrame(update); }, { passive: true });
  addEventListener('resize', buildDots);
  buildDots();
})();

// ----- Les boutons "Réserver à …" de l'équipe vont directement au bon salon -----
document.querySelectorAll('a[data-direct]').forEach(a => a.addEventListener('click', e => e.stopPropagation()));
