/* stars.js — fondo espacial con estrellas, sutil y theme-aware.
   Inmersivo en modo oscuro (espacio), muy sutil en claro (partículas). Cero dependencias.
   Respeta prefers-reduced-motion y pausa en pestañas ocultas. */
(function () {
  'use strict';
  if (window.__srmStars) return; window.__srmStars = true;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Estilos: dejamos ver el canvas detrás del contenido.
  var st = document.createElement('style');
  st.textContent =
    'html{background:var(--paper,#ECE7DA);}' +
    'body{background:transparent;}' +
    '#srm-stars{position:fixed;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;display:block;}';
  document.head.appendChild(st);

  var canvas = document.createElement('canvas');
  canvas.id = 'srm-stars';
  canvas.setAttribute('aria-hidden', 'true');
  (document.body || document.documentElement).appendChild(canvas);
  var ctx = canvas.getContext('2d');

  var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  var stars = [], shooters = [];
  var mx = 0, my = 0, sy = 0;

  function isDark() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t === 'dark') return true;
    if (t === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  var dark = isDark();

  var TINTS = ['255,255,255', '255,255,255', '205,214,255', '255,233,200', '198,235,255'];

  function rand(a, b) { return a + Math.random() * (b - a); }

  function build() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.floor(W * DPR); canvas.height = Math.floor(H * DPR);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var count = Math.min(200, Math.round((W * H) / 8500));
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: rand(0.4, 1.6),
        depth: rand(0.25, 1),
        a: rand(0.25, 1),
        tw: rand(0.004, 0.02),
        ph: Math.random() * Math.PI * 2,
        tint: TINTS[(Math.random() * TINTS.length) | 0]
      });
    }
  }

  function spawnShooter() {
    if (reduce || !dark) return;
    var fromLeft = Math.random() < 0.5;
    shooters.push({
      x: fromLeft ? rand(-40, W * 0.3) : rand(W * 0.7, W + 40),
      y: rand(0, H * 0.4),
      vx: (fromLeft ? 1 : -1) * rand(5, 9),
      vy: rand(2.5, 4.5),
      life: 0, max: rand(50, 80)
    });
  }

  var frame = 0;
  function draw() {
    frame++;
    if (dark) {
      var g = ctx.createLinearGradient(0, 0, W * 0.4, H);
      g.addColorStop(0, '#0c0a14');
      g.addColorStop(0.55, '#0f0d16');
      g.addColorStop(1, '#141210');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    } else {
      ctx.clearRect(0, 0, W, H);
    }

    var px = mx * 14, py = (my * 14) + (sy * 0.03);
    var maxA = dark ? 1 : 0.28;

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      if (!reduce) { s.ph += s.tw; }
      var tw = reduce ? s.a : (s.a * (0.55 + 0.45 * Math.sin(s.ph)));
      var alpha = Math.max(0, Math.min(maxA, tw * (dark ? 1 : 1)));
      var x = s.x + px * s.depth;
      var y = s.y + py * s.depth;
      var col = dark ? s.tint : '23,20,14';
      ctx.beginPath();
      ctx.arc(x, y, s.r * (dark ? 1 : 0.9), 0, 6.283);
      ctx.fillStyle = 'rgba(' + col + ',' + alpha.toFixed(3) + ')';
      ctx.fill();
      if (dark && s.r > 1.25 && alpha > 0.6) {
        ctx.beginPath(); ctx.arc(x, y, s.r * 2.6, 0, 6.283);
        ctx.fillStyle = 'rgba(' + s.tint + ',' + (alpha * 0.10).toFixed(3) + ')'; ctx.fill();
      }
      if (!reduce) {
        s.y += 0.02 + s.depth * 0.05;
        if (s.y - 2 > H) { s.y = -2; s.x = Math.random() * W; }
      }
    }

    // Shooting stars (solo oscuro)
    for (var j = shooters.length - 1; j >= 0; j--) {
      var sh = shooters[j];
      sh.life++; sh.x += sh.vx; sh.y += sh.vy;
      var k = 1 - sh.life / sh.max;
      if (k <= 0 || sh.x < -60 || sh.x > W + 60 || sh.y > H + 60) { shooters.splice(j, 1); continue; }
      var tx = sh.x - sh.vx * 6, ty = sh.y - sh.vy * 6;
      var grad = ctx.createLinearGradient(sh.x, sh.y, tx, ty);
      grad.addColorStop(0, 'rgba(255,255,255,' + (0.9 * k).toFixed(3) + ')');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = grad; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(sh.x, sh.y); ctx.lineTo(tx, ty); ctx.stroke();
    }
    if (!reduce && dark && frame % 240 === 0 && Math.random() < 0.7) spawnShooter();

    raf = requestAnimationFrame(draw);
  }

  var raf = 0;
  function start() { if (!raf) raf = requestAnimationFrame(draw); }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  // Interacción sutil
  if (!reduce) {
    window.addEventListener('mousemove', function (e) { mx = (e.clientX / W - 0.5); my = (e.clientY / H - 0.5); }, { passive: true });
    window.addEventListener('scroll', function () { sy = window.scrollY || 0; }, { passive: true });
  }
  window.addEventListener('resize', function () { DPR = Math.min(window.devicePixelRatio || 1, 2); build(); }, { passive: true });
  document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });

  // Reaccionar al cambio de tema
  var mo = new MutationObserver(function () { var d = isDark(); if (d !== dark) { dark = d; shooters = []; } });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  if (window.matchMedia) {
    try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () { dark = isDark(); }); } catch (e) {}
  }

  build();
  if (reduce) { draw(); stop(); /* un frame estático */ } else { start(); }
})();
