/* ============================================================
   Portfolio JS — animations + interactivity
   ============================================================ */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Pause heavy canvas work when the hero is scrolled out of view */
window.__heroHidden = false;
{
  const hero = document.querySelector('.hero');
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      window.__heroHidden = !entries[0].isIntersecting;
    }, { threshold: 0 }).observe(hero);
  }
}

/* ---------- Cursor glow ---------- */
const cursorGlow = document.querySelector('.cursor-glow');
if (cursorGlow) {
  let tx = 0, ty = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });
  function tick() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    cursorGlow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }
  tick();
}

/* ---------- Scroll progress + nav state ---------- */
const progressBar = document.querySelector('.scroll-progress');
const nav = document.querySelector('.nav');
const navLinks = document.querySelectorAll('.nav-link');
const sections = [...document.querySelectorAll('section[id]')];

function onScroll() {
  const h = document.documentElement;
  const scrolled = h.scrollTop;
  const max = h.scrollHeight - h.clientHeight;
  const pct = max > 0 ? scrolled / max : 0;
  if (progressBar) progressBar.style.transform = `scaleX(${pct})`;

  if (nav) nav.classList.toggle('scrolled', scrolled > 30);

  // active link
  const mid = scrolled + window.innerHeight * 0.35;
  let active = sections[0]?.id;
  for (const s of sections) {
    if (s.offsetTop <= mid) active = s.id;
  }
  navLinks.forEach((l) => {
    l.classList.toggle('active', l.dataset.target === active);
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Mobile menu ---------- */
(() => {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;
  const links = menu.querySelectorAll('a[href]');

  function setOpen(open) {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-hidden', String(!open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    // lock body scroll while open
    document.body.style.overflow = open ? 'hidden' : '';
  }
  toggle.addEventListener('click', () => setOpen(!document.body.classList.contains('menu-open')));
  links.forEach((l) => l.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  // close menu if resized up to desktop
  window.addEventListener('resize', () => { if (window.innerWidth > 768) setOpen(false); });

  // sync active state onto mobile links
  const mLinks = menu.querySelectorAll('.m-link');
  const origScroll = onScroll;
  window.addEventListener('scroll', () => {
    const active = [...document.querySelectorAll('.nav-link.active')][0]?.dataset.target;
    mLinks.forEach((l) => l.classList.toggle('active', l.dataset.target === active));
  }, { passive: true });
})();

/* ---------- Reveal on view ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

/* ---------- Animated counters ---------- */
const counterIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const val = el.dataset.value;
    const num = parseInt(val.replace(/\D/g, ''), 10);
    const suffix = val.replace(/[\d.]/g, '');
    const duration = 1800;
    const start = performance.now();
    function step(t) {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(num * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
    counterIO.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-value]').forEach((el) => counterIO.observe(el));

/* ---------- Typed roles ---------- */
const TYPED = ["AI Engineer", "Generative AI Developer", "RAG Engineer", "Agentic AI Developer"];
const typedEl = document.querySelector('[data-typed]');
if (typedEl) {
  let idx = 0, char = 0, deleting = false;
  function loop() {
    const cur = TYPED[idx];
    if (!deleting) {
      char++;
      typedEl.textContent = cur.slice(0, char);
      if (char === cur.length) { setTimeout(() => { deleting = true; loop(); }, 1600); return; }
      setTimeout(loop, 70);
    } else {
      char--;
      typedEl.textContent = cur.slice(0, char);
      if (char === 0) { deleting = false; idx = (idx + 1) % TYPED.length; setTimeout(loop, 200); return; }
      setTimeout(loop, 35);
    }
  }
  loop();
}

/* ---------- Skill card mouse glow ---------- */
document.querySelectorAll('.skill-card').forEach((card) => {
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

/* ---------- Orbit nodes positioning ---------- */
function placeOrbitNodes() {
  document.querySelectorAll('.orbit-stage').forEach((stage) => {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const cx = w / 2, cy = h / 2;
    stage.querySelectorAll('.orbit-node').forEach((node) => {
      const ring = parseFloat(node.dataset.ring); // 0..1 fraction of width
      const angle = parseFloat(node.dataset.angle) * Math.PI / 180;
      const radius = (Math.min(w, h) * ring) / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      node.style.left = `${x}px`;
      node.style.top = `${y}px`;
    });
  });
}
window.addEventListener('resize', placeOrbitNodes);
placeOrbitNodes();
// re-run after fonts/images load
setTimeout(placeOrbitNodes, 200);
window.addEventListener('load', placeOrbitNodes);

/* ---------- Magnetic CTA buttons ---------- */
if (!REDUCED_MOTION) document.querySelectorAll('.hero-ctas .btn').forEach((btn) => {
  btn.addEventListener('mousemove', (e) => {
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.22}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/* ---------- Console 3D tilt ---------- */
(() => {
  if (REDUCED_MOTION) return;
  const consoleEl = document.querySelector('.console');
  const heroRight = document.querySelector('.hero-right');
  if (!consoleEl || !heroRight) return;
  let raf = null;
  heroRight.addEventListener('mousemove', (e) => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      const r = consoleEl.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      consoleEl.style.transform = `rotateY(${px * 4}deg) rotateX(${py * -3}deg)`;
      raf = null;
    });
  });
  heroRight.addEventListener('mouseleave', () => {
    consoleEl.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
    consoleEl.style.transform = '';
    setTimeout(() => { consoleEl.style.transition = ''; }, 600);
  });
})();

/* ---------- Parallax hero orb ---------- */
const heroOrb = document.querySelector('.hero-orb');
if (heroOrb) {
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 40;
    const y = (e.clientY / window.innerHeight - 0.5) * 40;
    heroOrb.style.translate = `${x}px ${y}px`;
  });
}
const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#________";
function scrambleTo(el, target, duration = 1200) {
  const queue = [];
  const old = el.textContent;
  const len = Math.max(old.length, target.length);
  for (let i = 0; i < len; i++) {
    const from = old[i] || "";
    const to = target[i] || "";
    const start = Math.floor(Math.random() * 40);
    const end = start + Math.floor(Math.random() * 40) + 10;
    queue.push({ from, to, start, end, char: "" });
  }
  let frame = 0;
  function update() {
    let out = "", done = 0;
    for (const q of queue) {
      if (frame >= q.end) { done++; out += q.to; }
      else if (frame >= q.start) {
        if (!q.char || Math.random() < 0.28) q.char = SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        out += `<span style="color:var(--cyan)">${q.char}</span>`;
      } else out += q.from;
    }
    el.innerHTML = out;
    if (done < queue.length) { frame++; requestAnimationFrame(update); }
  }
  update();
}
const scrambleIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const target = e.target.dataset.scramble;
    setTimeout(() => scrambleTo(e.target, target), 600);
    scrambleIO.unobserve(e.target);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-scramble]').forEach((el) => scrambleIO.observe(el));

/* ---------- Live terminal log feed ---------- */
(() => {
  const body = document.getElementById('terminal-body');
  if (!body) return;
  const LOG_LINES = [
    { lvl: 'inf', msg: 'load <span class="v">smart_patient_card</span>' },
    { lvl: 'ok', msg: 'python environment ready' },
    { lvl: 'req', msg: 'POST /symptoms · NLP pipeline' },
    { lvl: 'inf', msg: 'extract entities · Marathi/Hindi text' },
    { lvl: 'ok', msg: 'OCR pipeline · prescription image' },
    { lvl: 'inf', msg: 'rag.retrieve · patient history' },
    { lvl: 'ok', msg: 'schema validation · Pydantic' },
    { lvl: 'req', msg: 'agent_step · follow-up question' },
    { lvl: 'inf', msg: 'langgraph.checkpoint · workflow state' },
    { lvl: 'ok', msg: 'safety check · interaction lookup' },
    { lvl: 'inf', msg: 'shap.explain · urgency prediction' },
    { lvl: 'ok', msg: 'fastapi · healthcare assistant' },
    { lvl: 'req', msg: 'GET /patient-card · 200 OK' },
    { lvl: 'inf', msg: 'guardrail · medicine/condition validation' },
  ];  const labelMap = { ok: 'OK', warn: 'WRN', req: 'REQ', inf: 'INF' };
  let i = Math.floor(Math.random() * LOG_LINES.length);
  const rows = [];
  // Dynamic row count based on container height
  function calcMaxRows() {
    const lineH = 22; // approx px (font 12 * line-height 1.7 + a bit)
    const innerH = body.clientHeight - 28; // minus padding
    return Math.max(8, Math.floor(innerH / lineH));
  }
  let MAX_ROWS = calcMaxRows();
  window.addEventListener('resize', () => { MAX_ROWS = calcMaxRows(); });

  function pad2(n) { return String(n).padStart(2, '0'); }
  function nowStr() {
    const d = new Date();
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
  }

  function addLine() {
    const l = LOG_LINES[i % LOG_LINES.length];
    i++;
    const row = document.createElement('div');
    row.className = 'log-row';
    row.style.opacity = '0';
    row.style.transform = 'translateY(8px)';
    row.style.transition = 'opacity .3s, transform .3s';
    row.innerHTML = `<span class="ts">${nowStr()}</span><span class="lvl ${l.lvl}">${labelMap[l.lvl]}</span><span class="msg">${l.msg}</span>`;
    body.appendChild(row);
    rows.push(row);
    requestAnimationFrame(() => { row.style.opacity = '1'; row.style.transform = 'translateY(0)'; });
    while (rows.length > MAX_ROWS) {
      const old = rows.shift();
      old.style.opacity = '0';
      old.style.transform = 'translateY(-8px)';
      setTimeout(() => old.remove(), 300);
    }
  }
  // seed enough lines to fully fill the visible area
  for (let k = 0; k < MAX_ROWS; k++) addLine();
  setInterval(addLine, 1400);
  // re-fill if container resizes taller (fonts/layout settling)
  function refill() {
    MAX_ROWS = calcMaxRows();
    while (rows.length < MAX_ROWS) addLine();
  }
  setTimeout(refill, 600);
  window.addEventListener('load', refill);
})();

/* ---------- Live metrics + sparklines ---------- */
(() => {
  const tps = document.getElementById('m-tps');
  const lat = document.getElementById('m-lat');
  const mod = document.getElementById('m-mod');
  const req = document.getElementById('m-req');
  const uptime = document.getElementById('m-uptime');
  if (!tps) return;

  const sparks = ['spark-1', 'spark-2', 'spark-3', 'spark-4'].map((id) => document.getElementById(id));
  const data = sparks.map(() => Array.from({ length: 20 }, () => Math.random() * 0.7 + 0.15));
  const colors = ['#57bdda', '#df7184', '#9f86e0', '#62cdba'];

  function drawSpark(svg, arr, color) {
    const w = 50, h = 18;
    const step = w / (arr.length - 1);
    let d = '';
    arr.forEach((v, i) => {
      const x = i * step;
      const y = h - v * h;
      d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
    });
    // area fill
    const area = d + `L${w},${h} L0,${h} Z`;
    svg.innerHTML = `
      <defs><linearGradient id="g-${color.slice(1)}" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.4"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </linearGradient></defs>
      <path d="${area}" fill="url(#g-${color.slice(1)})"/>
      <path d="${d}" fill="none" stroke="${color}" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
    `;
  }

  let tpsV = 128, latV = 142, modV = 4, reqV = 1.4;
  let upMin = 142 * 60 + 38;

  function tick() {
    tpsV = Math.max(80, Math.min(220, tpsV + (Math.random() - 0.5) * 18));
    latV = Math.max(80, Math.min(280, latV + (Math.random() - 0.5) * 30));
    if (Math.random() < 0.15) modV = Math.max(2, Math.min(6, modV + (Math.random() < 0.5 ? -1 : 1)));
    reqV = Math.max(0.4, Math.min(2.4, reqV + (Math.random() - 0.5) * 0.2));

    tps.textContent = Math.round(tpsV).toLocaleString();
    lat.textContent = Math.round(latV);
    mod.textContent = String(modV).padStart(2, '0');
    req.textContent = reqV.toFixed(1);

    upMin += 1;
    const h = Math.floor(upMin / 60);
    const m = upMin % 60;
    uptime.textContent = `${h}h ${String(m).padStart(2, '0')}m`;

    data[0].shift(); data[0].push(Math.min(1, tpsV / 2400));
    data[1].shift(); data[1].push(Math.min(1, latV / 280));
    data[2].shift(); data[2].push(modV / 12);
    data[3].shift(); data[3].push(reqV / 5.2);

    sparks.forEach((s, i) => drawSpark(s, data[i], colors[i]));
  }
  tick();
  setInterval(tick, 1400);
})();
(() => {
  const lossEl = document.getElementById('loss-readout');
  const epochEl = document.getElementById('epoch-readout');
  if (!lossEl || !epochEl) return;
  let loss = 0.0042;
  let epoch = 142;
  setInterval(() => {
    loss = Math.max(0.0001, loss + (Math.random() - 0.55) * 0.0008);
    epoch += 1;
    lossEl.textContent = `loss · ${loss.toFixed(4)}`;
    epochEl.textContent = `epoch ${epoch}/∞`;
  }, 1800);
})();

/* ============================================================
   Hero BACKGROUND full-bleed canvas (constellation + meteors)
   ============================================================ */
(() => {
  const canvas = document.getElementById('hero-bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0;
  let mouse = { x: -9999, y: -9999 };

  const stars = [];
  const meteors = [];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    init();
  }
  function init() {
    stars.length = 0;
    const count = Math.min(140, Math.floor(W * H / 9000));
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random() * 0.7 + 0.2,
        twinkle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.005,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.08,
      });
    }
  }
  function spawnMeteor() {
    const fromLeft = Math.random() < 0.5;
    const startX = fromLeft ? -50 : W + 50;
    const startY = Math.random() * H * 0.6;
    const vx = (fromLeft ? 1 : -1) * (3 + Math.random() * 2);
    const vy = 1 + Math.random() * 1.5;
    meteors.push({ x: startX, y: startY, vx, vy, life: 0, hue: Math.random() < 0.5 ? 'cyan' : 'violet' });
  }

  function colorOf(h, a) {
    if (h === 'cyan') return `rgba(87, 189, 218, ${a})`;
    if (h === 'violet') return `rgba(159, 134, 224, ${a})`;
    return `rgba(255, 255, 255, ${a})`;
  }

  let lastMeteor = 0;
  function frame(now) {
    if (window.__heroHidden) { requestAnimationFrame(frame); return; }
    ctx.clearRect(0, 0, W, H);

    // stars
    for (const s of stars) {
      s.x += s.vx; s.y += s.vy;
      if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;
      s.twinkle += s.speed;
      const tw = 0.5 + 0.5 * Math.sin(s.twinkle);

      // mouse parallax + repulse
      const dx = s.x - mouse.x;
      const dy = s.y - mouse.y;
      const d = Math.sqrt(dx*dx + dy*dy);
      let px = s.x, py = s.y;
      if (d < 200) {
        const f = (200 - d) / 200 * 12;
        px += (dx / d) * f;
        py += (dy / d) * f;
      }

      const alpha = s.a * (0.4 + 0.6 * tw);
      const grd = ctx.createRadialGradient(px, py, 0, px, py, s.r * 6);
      grd.addColorStop(0, `rgba(180, 200, 255, ${alpha * 0.6})`);
      grd.addColorStop(1, 'rgba(180, 200, 255, 0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(px, py, s.r * 6, 0, Math.PI * 2); ctx.fill();

      ctx.fillStyle = `rgba(220, 230, 255, ${alpha})`;
      ctx.beginPath(); ctx.arc(px, py, s.r, 0, Math.PI * 2); ctx.fill();
    }

    // connect near stars
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const a = stars[i], b = stars[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 90) {
          ctx.strokeStyle = `rgba(140, 180, 240, ${(1 - d / 90) * 0.08})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }

    // meteors
    if (now - lastMeteor > 2400 + Math.random() * 2000) {
      spawnMeteor();
      lastMeteor = now;
    }
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx; m.y += m.vy; m.life += 1;
      if (m.x < -200 || m.x > W + 200 || m.y > H + 100) { meteors.splice(i, 1); continue; }

      // trail
      const tx = m.x - m.vx * 16;
      const ty = m.y - m.vy * 16;
      const grad = ctx.createLinearGradient(tx, ty, m.x, m.y);
      grad.addColorStop(0, colorOf(m.hue, 0));
      grad.addColorStop(1, colorOf(m.hue, 0.7));
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(tx, ty); ctx.lineTo(m.x, m.y); ctx.stroke();

      // head
      ctx.fillStyle = colorOf(m.hue, 0.95);
      ctx.beginPath(); ctx.arc(m.x, m.y, 1.6, 0, Math.PI * 2); ctx.fill();
    }

    requestAnimationFrame(frame);
  }

  window.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(frame);
})();

/* ============================================================
   Hero neural network canvas (mini panel)
   ============================================================ */
(() => {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0, H = 0;
  let mouse = { x: -1000, y: -1000, active: false };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    init();
  }

  // Layered neural network
  let layers = [];
  function init() {
    layers = [];
    const cols = [3, 5, 6, 5, 3];
    const padding = 36;
    const innerW = W - padding * 2;
    const colGap = innerW / (cols.length - 1);
    cols.forEach((n, ci) => {
      const x = padding + colGap * ci;
      const layer = [];
      const rowGap = (H - 80) / (n + 1);
      for (let i = 0; i < n; i++) {
        layer.push({
          x,
          y: 40 + rowGap * (i + 1),
          baseX: x,
          baseY: 40 + rowGap * (i + 1),
          phase: Math.random() * Math.PI * 2,
          activation: Math.random(),
          targetAct: Math.random()
        });
      }
      layers.push(layer);
    });
  }

  // Floating particles in background
  const particles = [];
  function initParticles() {
    particles.length = 0;
    const count = 30;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        r: Math.random() * 1.2 + 0.4,
        a: Math.random() * 0.6 + 0.2
      });
    }
  }

  // Signals flowing along edges
  const signals = [];
  function spawnSignal() {
    if (layers.length < 2) return;
    const li = Math.floor(Math.random() * (layers.length - 1));
    const from = layers[li][Math.floor(Math.random() * layers[li].length)];
    const to = layers[li + 1][Math.floor(Math.random() * layers[li + 1].length)];
    signals.push({ from, to, t: 0, speed: 0.012 + Math.random() * 0.012, hue: Math.random() < 0.5 ? 'cyan' : 'violet' });
  }

  function colorOf(name, alpha) {
    if (name === 'cyan') return `rgba(87, 189, 218, ${alpha})`;
    if (name === 'violet') return `rgba(159, 134, 224, ${alpha})`;
    if (name === 'mint') return `rgba(98, 205, 186, ${alpha})`;
    return `rgba(255,255,255,${alpha})`;
  }

  let lastSpawn = 0;
  let t0 = performance.now();

  function frame(now) {
    if (window.__heroHidden) { requestAnimationFrame(frame); return; }
    const t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);

    // bg subtle gradient grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 1;
    const gridStep = 32;
    for (let x = 0; x < W; x += gridStep) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += gridStep) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // particles
    particles.forEach((p) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.fillStyle = `rgba(200, 220, 255, ${p.a * 0.4})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });

    // update node positions w/ slow drift + mouse repel
    layers.forEach((layer) => {
      layer.forEach((n) => {
        n.x = n.baseX + Math.sin(t + n.phase) * 3;
        n.y = n.baseY + Math.cos(t * 0.8 + n.phase) * 3;
        // mouse repulsion
        if (mouse.active) {
          const dx = n.x - mouse.x;
          const dy = n.y - mouse.y;
          const d = Math.sqrt(dx*dx + dy*dy);
          if (d < 80) {
            const force = (80 - d) / 80 * 12;
            n.x += (dx / d) * force;
            n.y += (dy / d) * force;
          }
        }
        // activation drift
        n.activation += (n.targetAct - n.activation) * 0.04;
        if (Math.random() < 0.005) n.targetAct = Math.random();
      });
    });

    // edges between adjacent layers
    for (let li = 0; li < layers.length - 1; li++) {
      const a = layers[li], b = layers[li + 1];
      a.forEach((na) => {
        b.forEach((nb) => {
          const opacity = 0.04 + 0.06 * Math.min(na.activation, nb.activation);
          ctx.strokeStyle = `rgba(180, 200, 255, ${opacity})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(na.x, na.y);
          ctx.lineTo(nb.x, nb.y);
          ctx.stroke();
        });
      });
    }

    // spawn signals
    if (now - lastSpawn > 90) {
      spawnSignal();
      lastSpawn = now;
    }

    // draw signals
    for (let i = signals.length - 1; i >= 0; i--) {
      const s = signals[i];
      s.t += s.speed;
      if (s.t >= 1) { signals.splice(i, 1); continue; }
      const x = s.from.x + (s.to.x - s.from.x) * s.t;
      const y = s.from.y + (s.to.y - s.from.y) * s.t;

      // signal glow
      const grd = ctx.createRadialGradient(x, y, 0, x, y, 14);
      grd.addColorStop(0, colorOf(s.hue, 0.7));
      grd.addColorStop(1, colorOf(s.hue, 0));
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fill();

      // signal core
      ctx.fillStyle = colorOf(s.hue, 0.95);
      ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();

      // bright the destination node
      s.to.activation = Math.min(1, s.to.activation + 0.04);
    }

    // draw nodes
    layers.forEach((layer, li) => {
      layer.forEach((n) => {
        const act = n.activation;
        const r = 4 + act * 2.5;

        // glow
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 5);
        grd.addColorStop(0, `rgba(87, 189, 218, ${0.25 * act})`);
        grd.addColorStop(1, 'rgba(87, 189, 218, 0)');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(n.x, n.y, r * 5, 0, Math.PI * 2); ctx.fill();

        // core
        const isEdge = li === 0 || li === layers.length - 1;
        ctx.fillStyle = isEdge
          ? `rgba(159, 134, 224, ${0.5 + act * 0.5})`
          : `rgba(87, 189, 218, ${0.45 + act * 0.55})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2); ctx.fill();

        // ring
        ctx.strokeStyle = `rgba(255,255,255,${0.1 + act * 0.2})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(n.x, n.y, r + 2, 0, Math.PI * 2); ctx.stroke();
      });
    });

    requestAnimationFrame(frame);
  }

  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
    mouse.active = true;
  });
  canvas.addEventListener('mouseleave', () => { mouse.active = false; mouse.x = mouse.y = -1000; });

  window.addEventListener('resize', resize);
  resize();
  initParticles();
  requestAnimationFrame(frame);
})();
