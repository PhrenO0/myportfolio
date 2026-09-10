/* 오준상 — Portfolio. Vanilla JS, no dependencies. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- preloader ---------------- */
  function preloader() {
    var pre = document.querySelector('.pre'), n = document.querySelector('.pre__n');
    if (!pre) return done();
    var v = 0;
    var t = setInterval(function () {
      v += Math.random() * 13;
      if (v >= 100) { v = 100; clearInterval(t); setTimeout(done, 320); }
      n.textContent = String(Math.floor(v)).padStart(3, '0');
    }, 60);
    function done() {
      if (pre) pre.classList.add('done');
      document.querySelector('.hero').classList.add('ready');
      setTimeout(function () { if (pre) pre.style.display = 'none'; }, 1100);
    }
  }
  if (reduce) {
    var p = document.querySelector('.pre'); if (p) p.style.display = 'none';
    document.querySelector('.hero').classList.add('ready');
  } else { window.addEventListener('load', preloader); }

  /* ---------------- cursor ---------------- */
  (function () {
    if (window.matchMedia('(hover: none)').matches) return;
    var dot = document.querySelector('.cursor'), ring = document.querySelector('.cursor-ring');
    if (!dot) return;
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    });
    (function loop() {
      rx += (mx - rx) * .16; ry += (my - ry) * .16;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', function (e) {
      var hot = e.target.closest('a,button,.work,.tcell,.tl__row');
      ring.classList.toggle('is-hot', !!hot);
    });
  })();

  /* ---------------- scroll progress ---------------- */
  var bar = document.querySelector('.progress');
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + '%';
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------------- reveal ---------------- */
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });

  /* ---------------- work filters ---------------- */
  document.querySelectorAll('.filters button').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.dataset.f;
      document.querySelectorAll('.filters button').forEach(function (x) { x.classList.toggle('on', x === b); });
      document.querySelectorAll('.work').forEach(function (w) {
        w.classList.toggle('hide', f !== 'all' && (w.dataset.cat || '').indexOf(f) === -1);
      });
    });
  });

  /* ---------------- case overlay ---------------- */
  var overlay = document.querySelector('.case'), body = document.querySelector('.case__in');
  function openCase(id) {
    var src = document.getElementById('case-' + id);
    if (!src) return;
    body.innerHTML = src.innerHTML;
    overlay.classList.add('open');
    overlay.scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }
  function closeCase() { overlay.classList.remove('open'); document.body.style.overflow = ''; }
  document.querySelectorAll('[data-case]').forEach(function (b) {
    b.addEventListener('click', function () { openCase(b.dataset.case); });
  });
  document.querySelector('.case__close button').addEventListener('click', closeCase);
  addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCase(); });

  /* ---------------- hero particle field ---------------- */
  (function () {
    var c = document.querySelector('.hero__canvas'); if (!c || reduce) return;
    var ctx = c.getContext('2d'), pts = [], W, H, dpr = Math.min(devicePixelRatio || 1, 2);
    function size() {
      W = c.clientWidth; H = c.clientHeight;
      c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(88, W / 15));
      pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22 });
    }
    size(); addEventListener('resize', size); addEventListener('load', size);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
    var mx = -9999, my = -9999;
    addEventListener('mousemove', function (e) { var r = c.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    (function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < pts.length; i++) {
        var a = pts[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > W) a.vx *= -1;
        if (a.y < 0 || a.y > H) a.vy *= -1;
        for (var j = i + 1; j < pts.length; j++) {
          var b2 = pts[j], dx = a.x - b2.x, dy = a.y - b2.y, d = Math.hypot(dx, dy);
          if (d < 132) {
            ctx.strokeStyle = 'rgba(244,241,234,' + (.13 * (1 - d / 132)).toFixed(3) + ')';
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b2.x, b2.y); ctx.stroke();
          }
        }
        var dm = Math.hypot(a.x - mx, a.y - my);
        ctx.fillStyle = dm < 150 ? 'rgba(255,90,31,.85)' : 'rgba(244,241,234,.34)';
        ctx.beginPath(); ctx.arc(a.x, a.y, dm < 150 ? 2.1 : 1.3, 0, 6.284); ctx.fill();
      }
      requestAnimationFrame(draw);
    })();
  })();

  /* ---------------- keyword field ---------------- */
  (function () {
    var host = document.querySelector('.field'); if (!host) return;
    var c = host.querySelector('canvas'), ctx = c.getContext('2d');
    var words = JSON.parse(host.dataset.words);
    var dpr = Math.min(devicePixelRatio || 1, 2), W, H, items = [];
    function build() {
      W = host.clientWidth; H = host.clientHeight;
      c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      items = words.map(function (w) {
        var s = Math.max(13, Math.min(30, W / 34)) * (w.w || 1);
        ctx.font = '700 ' + s + 'px Pretendard, sans-serif';
        var tw = ctx.measureText(w.t).width + 26, th = s + 16;
        return {
          t: w.t, s: s, hot: !!w.hot, w: tw, h: th,
          x: Math.random() * Math.max(1, W - tw), y: Math.random() * Math.max(1, H - th),
          vx: (Math.random() - .5) * .6, vy: (Math.random() - .5) * .6
        };
      });
    }
    build(); addEventListener('resize', build);
    var mx = -9999, my = -9999;
    host.addEventListener('mousemove', function (e) { var r = host.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    host.addEventListener('mouseleave', function () { mx = my = -9999; });
    (function draw() {
      ctx.clearRect(0, 0, W, H);
      items.forEach(function (o) {
        o.x += o.vx; o.y += o.vy;
        if (o.x < 0) { o.x = 0; o.vx = Math.abs(o.vx); }
        if (o.x + o.w > W) { o.x = W - o.w; o.vx = -Math.abs(o.vx); }
        if (o.y < 0) { o.y = 0; o.vy = Math.abs(o.vy); }
        if (o.y + o.h > H) { o.y = H - o.h; o.vy = -Math.abs(o.vy); }
        var cx = o.x + o.w / 2, cy = o.y + o.h / 2, dx = cx - mx, dy = cy - my, d = Math.hypot(dx, dy);
        if (d < 130 && d > .1) { o.vx += (dx / d) * .5; o.vy += (dy / d) * .5; }
        var sp = Math.hypot(o.vx, o.vy);
        if (sp > 1.5) { o.vx *= 1.5 / sp; o.vy *= 1.5 / sp; }
        o.vx *= .992; o.vy *= .992;
        if (Math.abs(o.vx) < .05) o.vx += (Math.random() - .5) * .1;
        if (Math.abs(o.vy) < .05) o.vy += (Math.random() - .5) * .1;
        var near = d < 130;
        for (var k = 0; k < items.length; k++) {
          var q = items[k]; if (q === o) continue;
          var ox = Math.min(o.x + o.w, q.x + q.w) - Math.max(o.x, q.x);
          var oy = Math.min(o.y + o.h, q.y + q.h) - Math.max(o.y, q.y);
          if (ox > 0 && oy > 0) {
            if (ox < oy) { var s1 = (o.x < q.x ? -1 : 1) * ox * .06; o.x += s1; q.x -= s1; }
            else { var s2 = (o.y < q.y ? -1 : 1) * oy * .06; o.y += s2; q.y -= s2; }
          }
        }
        ctx.strokeStyle = near ? 'rgba(255,90,31,.9)' : 'rgba(244,241,234,.16)';
        ctx.lineWidth = 1;
        ctx.strokeRect(o.x + .5, o.y + .5, o.w - 1, o.h - 1);
        ctx.font = '700 ' + o.s + 'px Pretendard, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = near ? '#ff5a1f' : (o.hot ? 'rgba(244,241,234,.92)' : 'rgba(244,241,234,.45)');
        ctx.fillText(o.t, o.x + 13, cy + 1);
      });
      requestAnimationFrame(draw);
    })();
  })();
})();
