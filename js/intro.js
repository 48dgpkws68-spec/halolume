/* HALOLUME intro: motion-graphics film op canvas (±11 s), harde cuts, 1x per sessie, overslaan kan */
(function () {
  var box = document.querySelector('.intro');
  if (!box) return;
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seen = false;
  try { seen = sessionStorage.getItem('haloIntro') === '1'; } catch (e) {}
  var running = false, raf;
  function finish() {
    if (box.classList.contains('out')) return;
    box.classList.add('out');
    document.documentElement.classList.remove('lock');
    try { sessionStorage.setItem('haloIntro', '1'); } catch (e) {}
    document.body.classList.add('go');
    setTimeout(function () { box.hidden = true; running = false; cancelAnimationFrame(raf); }, 900);
  }
  var MOBILE = matchMedia('(max-width: 900px)').matches;
  if (RM || seen || MOBILE) { box.hidden = true; document.body.classList.add('go'); return; }
  document.documentElement.classList.add('lock');
  box.querySelector('.skip').addEventListener('click', finish);
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && running) finish(); });

  var cv = box.querySelector('canvas'), cx = cv.getContext('2d'), W, H, M, dpr;
  function size() { dpr = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; M = Math.min(W, H); cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px'; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  addEventListener('resize', size); size();

  var HUES = [190, 230, 280, 330, 30];
  var DISP = '700 X "Space Grotesk", "Arial Black", sans-serif', MONO = '500 X "JetBrains Mono", Menlo, monospace';
  function f(t, px) { return t.replace('X', Math.round(px) + 'px'); }
  function cl(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function eo(t) { return 1 - Math.pow(1 - cl(t), 4); }
  function ex(t) { t = cl(t); return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function hsl(h, s, l, a) { return 'hsla(' + h + ',' + s + '%,' + l + '%,' + (a == null ? 1 : a) + ')'; }
  var NOW = 0, T0 = 0;

  function hud(col, label) {
    var pad = Math.max(16, M * .035), fs = Math.max(9, M * .016);
    cx.save(); cx.globalAlpha = .65; cx.strokeStyle = col; cx.fillStyle = col; cx.lineWidth = 1;
    cx.strokeRect(pad, pad, W - pad * 2, H - pad * 2);
    cx.font = f(MONO, fs); cx.textBaseline = 'top';
    var s = (NOW / 1000).toFixed(2).padStart(5, '0');
    cx.textAlign = 'left'; cx.fillText('HALOLUME / AMBIENT SYNC', pad + 10, pad + 10);
    cx.textAlign = 'right'; cx.fillText('00:' + s.replace('.', ':'), W - pad - 10, pad + 10);
    cx.textBaseline = 'bottom'; cx.fillText('HALOLUME.NL', W - pad - 10, H - pad - 10);
    cx.textAlign = 'left'; cx.fillText(label || 'RGB · SENSOR SYNC · 24 SCENES', pad + 10, H - pad - 10);
    [[pad, pad], [W - pad, pad], [pad, H - pad], [W - pad, H - pad]].forEach(function (q) { cx.fillRect(q[0] - 5, q[1] - .5, 10, 1); cx.fillRect(q[0] - .5, q[1] - 5, 1, 10); });
    cx.restore();
  }
  function word(txt, t, col, scale) {
    var sz = Math.min(W * (scale || .16), H * .3);
    cx.save(); cx.font = f(DISP, sz); cx.textAlign = 'center'; cx.textBaseline = 'middle';
    var k = ex(t * 3), off = (1 - k) * W * .5;
    for (var i = 4; i > 0; i--) { cx.globalAlpha = .12 * k; cx.fillStyle = col; cx.fillText(txt, W / 2 + off + i * 26 * (1 - k), H / 2); }
    cx.globalAlpha = 1; cx.fillStyle = col; cx.shadowColor = col; cx.shadowBlur = 40 * k; cx.fillText(txt, W / 2 + off, H / 2);
    cx.restore();
  }
  function tvRect(p) { var w = Math.min(W * .62, H * .9 * 16 / 9), h = w * 9 / 16; return [W / 2 - w / 2, H / 2 - h / 2, w, h]; }
  function strokeTv(p, hue, glow) {
    var r = tvRect(), x = r[0], y = r[1], w = r[2], h = r[3], per = 2 * (w + h), len = per * cl(p);
    cx.save(); cx.lineWidth = Math.max(2, M * .006); cx.lineCap = 'round';
    cx.strokeStyle = hsl(hue, 100, 62); cx.shadowColor = hsl(hue, 100, 60); cx.shadowBlur = glow;
    cx.beginPath(); cx.moveTo(x + w / 2, y);
    var pts = [[x + w, y], [x + w, y + h], [x, y + h], [x, y], [x + w / 2, y]], px = x + w / 2, py = y, left = len;
    for (var i = 0; i < pts.length && left > 0; i++) {
      var dx = pts[i][0] - px, dy = pts[i][1] - py, d = Math.hypot(dx, dy), k = Math.min(1, left / d);
      cx.lineTo(px + dx * k, py + dy * k); left -= d; px = pts[i][0]; py = pts[i][1];
    }
    cx.stroke(); cx.restore();
  }

  var scenes = [
    { d: 1600, draw: function (t) { // zwart, één punt licht pulseert, dan lijn
      cx.fillStyle = '#030308'; cx.fillRect(0, 0, W, H);
      var r = 3 + 60 * ex(t), g = cx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, r * 4);
      g.addColorStop(0, hsl(190, 100, 70, 1)); g.addColorStop(1, 'transparent');
      cx.fillStyle = g; cx.fillRect(0, 0, W, H);
      hud('rgba(255,255,255,.5)', 'STANDBY');
    } },
    { d: 1700, draw: function (t) { // tv-kader tekent zich
      cx.fillStyle = '#030308'; cx.fillRect(0, 0, W, H);
      strokeTv(eo(t * 1.2), 190 + t * 90, 30);
      hud(hsl(190, 100, 70), 'SENSOR ONLINE');
    } },
    { d: 1100, draw: function (t) { cx.fillStyle = '#05050c'; cx.fillRect(0, 0, W, H); word('JE TV', t, '#ffffff'); hud('#fff'); } },
    { d: 1100, draw: function (t) { cx.fillStyle = hsl(250, 90, 55); cx.fillRect(0, 0, W, H); word('MAAR DAN', t, '#05050c', .13); hud('#05050c'); } },
    { d: 2300, draw: function (t) { // kleurgolf rondom tv: de halo
      var hue = 190 + t * 200;
      cx.fillStyle = '#030308'; cx.fillRect(0, 0, W, H);
      var r = tvRect();
      for (var i = 0; i < 5; i++) {
        var hh = HUES[(i + Math.floor(t * 8)) % 5], sp = (1 + i * .18) * (0.6 + .4 * eo(t * 2));
        cx.save(); cx.translate(W / 2, H / 2); cx.scale(sp, sp);
        cx.shadowColor = hsl(hh, 100, 60); cx.shadowBlur = 120; cx.strokeStyle = hsl(hh, 100, 60, .5 - i * .08); cx.lineWidth = 30;
        cx.strokeRect(-r[2] / 2, -r[3] / 2, r[2], r[3]); cx.restore();
      }
      cx.fillStyle = '#000'; cx.fillRect(r[0], r[1], r[2], r[3]);
      var g = cx.createLinearGradient(r[0], 0, r[0] + r[2], 0);
      g.addColorStop(0, hsl(hue, 90, 30)); g.addColorStop(1, hsl(hue + 80, 90, 40));
      cx.globalAlpha = .9; cx.fillStyle = g; cx.fillRect(r[0] + 6, r[1] + 6, r[2] - 12, r[3] - 12); cx.globalAlpha = 1;
      strokeTv(1, hue, 50);
      hud(hsl(hue, 100, 70), 'SYNC · ' + Math.round(hue % 360) + '°');
    } },
    { d: 1400, draw: function (t) { // glitch-woord
      cx.fillStyle = '#030308'; cx.fillRect(0, 0, W, H);
      var sz = Math.min(W * .12, H * .22); cx.font = f(DISP, sz); cx.textAlign = 'center'; cx.textBaseline = 'middle';
      var j = (1 - ex(t * 2)) * 30;
      cx.globalCompositeOperation = 'lighter';
      cx.fillStyle = hsl(190, 100, 55); cx.fillText('SFEERVOLLER', W / 2 - j, H / 2);
      cx.fillStyle = hsl(330, 100, 55); cx.fillText('SFEERVOLLER', W / 2 + j, H / 2);
      cx.fillStyle = hsl(50, 100, 60); cx.fillText('SFEERVOLLER', W / 2, H / 2 + j * .4);
      cx.globalCompositeOperation = 'source-over';
      hud('#fff');
    } },
    { d: 1600, draw: function (t) { // logo-reveal
      cx.fillStyle = '#05050c'; cx.fillRect(0, 0, W, H);
      var r = tvRect(), k = eo(t * 1.5), s = .35 + .05 * k;
      cx.save(); cx.translate(W / 2, H * .44); cx.scale(s, s);
      var hue = 190 + t * 160;
      cx.shadowColor = hsl(hue, 100, 60); cx.shadowBlur = 80; cx.strokeStyle = hsl(hue, 100, 65); cx.lineWidth = 18;
      cx.beginPath(); cx.roundRect(-r[2] / 2, -r[3] / 2, r[2], r[3], 60); cx.stroke();
      cx.shadowBlur = 0; cx.fillStyle = '#fff'; cx.font = f(DISP, r[3] * .55); cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText('H', 0, 10);
      cx.restore();
      cx.globalAlpha = k; cx.fillStyle = '#fff'; cx.font = f(DISP.replace('700', '600'), Math.min(W * .05, 46)); cx.textAlign = 'center';
      cx.fillText('H A L O L U M E', W / 2, H * .74); cx.globalAlpha = 1;
      hud('rgba(255,255,255,.6)', 'BEYOND THE FRAME');
    } },
  ];
  var total = scenes.reduce(function (a, s) { return a + s.d; }, 0);
  function frame(ts) {
    if (!running) return;
    if (!T0) T0 = ts; NOW = ts - T0;
    if (NOW >= total) { finish(); return; }
    var acc = 0;
    for (var i = 0; i < scenes.length; i++) { if (NOW < acc + scenes[i].d) { scenes[i].draw((NOW - acc) / scenes[i].d); break; } acc += scenes[i].d; }
    box.querySelector('.bar i').style.width = (NOW / total * 100) + '%';
    raf = requestAnimationFrame(frame);
  }
  function start() { running = true; T0 = 0; raf = requestAnimationFrame(frame); }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
})();
