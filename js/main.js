// Halolume · alle interactie
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const smooth = (t) => t * t * (3 - 2 * t);

  // Shopify-winkel 3 (0f76bd-xw), product 16083980616011
  const SHOP = "https://0f76bd-xw.myshopify.com";
  const PRODUCTS = {
    "4m": { single: { price: 29.99, variant: "58852759667019", qty: 1 }, duo: { price: 49.99, variant: "58852759699787", qty: 1 } },
    "5m": { single: { price: 29.99, variant: "58852759732555", qty: 1 }, duo: { price: 49.99, variant: "58852759765323", qty: 1 } },
  };
  const eur = (n) => "€" + n.toFixed(2).replace(".", ",");

  // ---------- kop in woorden splitsen ----------
  $$(".split").forEach((el) => {
    let i = 0;
    const walk = (n) => [...n.childNodes].forEach((c) => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach((w) => {
          if (!w.trim()) return frag.append(w);
          const s = document.createElement("span"); s.className = "w"; s.textContent = w;
          s.style.transitionDelay = (0.15 + i++ * 0.09) + "s"; frag.append(s);
        });
        c.replaceWith(frag);
      } else if (c.nodeType === 1 && c.tagName !== "BR") walk(c);
    });
    walk(el);
  });

  // ---------- sfeerkleur ----------
  let mood = [190, 100, 60];
  function hexToHsl(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255, g = parseInt(hex.slice(3, 5), 16) / 255, b = parseInt(hex.slice(5, 7), 16) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0;
    if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [(h * 60 + 360) % 360, d ? 100 : 0, ((mx + mn) / 2) * 100];
  }
  function setMood(hex) { root.style.setProperty("--mood", hex); mood = hexToHsl(hex); }

  // ---------- aurora-achtergrond ----------
  const au = $("#aurora"), ax = au.getContext("2d");
  let AW, AH;
  const blobs = Array.from({ length: 5 }, (_, i) => ({ x: Math.random(), y: Math.random(), r: 0.35 + Math.random() * 0.3, s: 0.00006 + Math.random() * 0.00008, o: i * 1.7, dh: [-40, 0, 40, 80, -80][i] }));
  function aSize() { AW = au.width = innerWidth / 3; AH = au.height = innerHeight / 3; }
  aSize(); addEventListener("resize", aSize);
  function aurora(t) {
    ax.fillStyle = "#05050c"; ax.fillRect(0, 0, AW, AH);
    ax.globalCompositeOperation = "lighter";
    blobs.forEach((b) => {
      const x = (0.5 + 0.45 * Math.sin(t * b.s + b.o)) * AW, y = (0.5 + 0.45 * Math.cos(t * b.s * 1.3 + b.o)) * AH, r = b.r * Math.max(AW, AH);
      const g = ax.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `hsla(${(mood[0] + b.dh + 360) % 360},90%,50%,.22)`); g.addColorStop(1, "transparent");
      ax.fillStyle = g; ax.fillRect(0, 0, AW, AH);
    });
    ax.globalCompositeOperation = "source-over";
  }

  // ---------- cursor-gloed ----------
  const cg = $(".cursor-glow"); let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

  // ---------- live sync-demo ----------
  const cv = $("#screen"), ctx = cv.getContext("2d", { willReadFrequently: true }), W = cv.width, H = cv.height;
  let scene = "film", st = 0, cur = [235, 100, 55], demoVisible = true;
  const scenes = {
    film(t) {
      const p = (t % 12) / 12, night = p > 0.5;
      const sky = ctx.createLinearGradient(0, 0, 0, H), hue = 20 + Math.sin(t * 0.3) * 20 + (night ? 200 : 0);
      sky.addColorStop(0, `hsl(${hue},80%,${night ? 12 : 45}%)`); sky.addColorStop(1, `hsl(${hue + 20},90%,${night ? 25 : 60}%)`);
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      const sx = W * 0.5 + Math.sin(t * 0.4) * 90, sy = H * (0.45 + 0.1 * Math.sin(t * 0.2));
      const r = night && t % 4 < 0.8 ? 180 * ((t % 4) / 0.8) : 50;
      const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
      sun.addColorStop(0, night ? "#fff3c0" : "#ffe9a8"); sun.addColorStop(0.4, night ? "#ff6a00" : "#ff8a3d"); sun.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sun; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#05050a";
      for (let i = 0; i < 12; i++) { const bx = ((i * 47 + t * 12) % (W + 50)) - 50, bh = 40 + ((i * 37) % 80); ctx.fillRect(bx, H - bh, 40, bh); }
    },
    game(t) {
      ctx.fillStyle = "#07001a"; ctx.fillRect(0, 0, W, H);
      const hue = (t * 40) % 360;
      for (let i = 0; i < 16; i++) {
        const z = (i / 16 + t * 0.6) % 1, y = H * 0.5 + z * z * H * 0.5;
        ctx.strokeStyle = `hsla(${hue + i * 8},100%,60%,${z})`; ctx.lineWidth = 1 + z * 4;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      for (let k = -5; k <= 5; k++) { ctx.strokeStyle = `hsla(${hue + 120},100%,60%,.6)`; ctx.beginPath(); ctx.moveTo(W / 2, H * 0.5); ctx.lineTo(W / 2 + k * 110, H); ctx.stroke(); }
      const g = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, 100);
      g.addColorStop(0, `hsl(${hue + 60},100%,70%)`); g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = `hsl(${hue + 180},100%,60%)`; ctx.fillRect(W / 2 - 26 + Math.sin(t * 2) * 80, H - 56, 52, 22);
    },
    sport(t) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#0b1d3a"); g.addColorStop(0.35, "#1d6b2c"); g.addColorStop(1, "#2fa344");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(W / 2, H * 0.72, 100, 30, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W / 2, H * 0.38); ctx.lineTo(W / 2, H); ctx.stroke();
      for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? "#ff7a00" : "#ffffff"; ctx.beginPath(); ctx.arc((i * 61 + t * 40 * (i % 2 ? 1 : -1) + W * 4) % W, H * (0.55 + (i % 3) * 0.12), 6, 0, 7); ctx.fill(); }
      if (t % 6 > 5) { ctx.fillStyle = `rgba(255,140,0,${1 - ((t % 6) - 5)})`; ctx.fillRect(0, 0, W, H); }
    },
    music(t) {
      ctx.fillStyle = "#0a0014"; ctx.fillRect(0, 0, W, H);
      const n = 28, bw = W / n;
      for (let i = 0; i < n; i++) {
        const h = (0.3 + 0.7 * Math.abs(Math.sin(t * 3 + i * 0.6) * Math.cos(t * 1.3 + i))) * H * 0.85;
        ctx.fillStyle = `hsl(${(i * 12 + t * 60) % 360},100%,60%)`; ctx.fillRect(i * bw + 2, H - h, bw - 4, h);
      }
    },
    cozy(t) {
      ctx.fillStyle = "#120500"; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 50; i++) {
        const x = W / 2 + Math.sin(i * 7.1 + t * 2) * 120, y = H - ((i * 13 + t * 70) % H);
        const g = ctx.createRadialGradient(x, y, 0, x, y, 60);
        g.addColorStop(0, `rgba(255,${120 + (i % 5) * 20},20,.5)`); g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.fillRect(x - 60, y - 60, 120, 120);
      }
    },
  };
  function sample() {
    const d = ctx.getImageData(0, 0, W, H).data;
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 4 * 53) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
    r /= n * 255; g /= n * 255; b /= n * 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), dd = mx - mn; let h = 0;
    if (dd) h = mx === r ? ((g - b) / dd) % 6 : mx === g ? (b - r) / dd + 2 : (r - g) / dd + 4;
    return [(h * 60 + 360) % 360, dd < 0.04 ? 20 : 100, Math.max(30, Math.min(60, mx * 70))];
  }
  const hudScene = $("#hudScene"), hudHex = $("#hudHex");
  function hslHex(h, s, l) {
    s /= 100; l /= 100; const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
    return "#" + [f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
  }
  new IntersectionObserver((es) => (demoVisible = es[0].isIntersecting)).observe($("#stage"));
  const names = { film: "FILM", game: "GAMEN", sport: "VOETBAL", music: "MUZIEK", cozy: "HAARDVUUR" };
  let auto = setInterval(() => {
    const k = Object.keys(scenes); scene = k[(k.indexOf(scene) + 1) % k.length]; hudScene.textContent = names[scene];
    $$(".chip").forEach((x) => x.classList.toggle("active", x.dataset.scene === scene));
  }, 6500);
  $$(".chip").forEach((b) => b.addEventListener("click", () => {
    clearInterval(auto);
    $$(".chip").forEach((x) => x.classList.remove("active")); b.classList.add("active");
    scene = b.dataset.scene; hudScene.textContent = names[scene];
  }));

  // ---------- licht aan (sticky scroll) ----------
  const lights = $("#aan"), roomOn = $(".room.on"), roomOff = $(".room.off"), lls = $$(".ll"), lStep = $("#lightsStep"), lMeter = $("#lightsMeter");
  function lightsScroll() {
    const r = lights.getBoundingClientRect(), p = clamp(-r.top / (r.height - innerHeight));
    const on = smooth(clamp((p - 0.3) / 0.4));
    roomOn.style.opacity = on;
    roomOn.style.filter = `saturate(${1 + on * 0.3})`;
    const z = 1.12 - p * 0.12; roomOn.style.transform = roomOff.style.transform = `scale(${z})`;
    const idx = p < 0.33 ? 0 : p < 0.7 ? 1 : 2;
    lls.forEach((l, i) => l.classList.toggle("active", i === idx));
    lStep.textContent = `0${idx + 1} / 03`; lMeter.style.width = p * 100 + "%";
  }

  // ---------- kamers horizontaal ----------
  const rooms = $("#kamers"), track = $("#roomsTrack");
  function roomsScroll() {
    const r = rooms.getBoundingClientRect(), p = clamp(-r.top / (r.height - innerHeight));
    const max = track.scrollWidth - innerWidth + 48;
    track.style.transform = `translateX(${-p * Math.max(0, max)}px)`;
  }

  // ---------- parallax, voortgang, nav ----------
  const prog = $(".progress i"), nav = $("#nav"), heroImg = $(".hero-media img");
  let lastY = 0;
  function onScroll() {
    const y = scrollY, h = document.body.scrollHeight - innerHeight;
    prog.style.width = (y / h) * 100 + "%";
    nav.classList.toggle("hide", y > 400 && y > lastY + 4); if (y < lastY - 4 || y < 400) nav.classList.remove("hide"); lastY = y;
    if (y < innerHeight * 1.2 && document.body.classList.contains("go")) heroImg.style.transform = `translateY(${y * 0.18}px) scale(${1 + y * 0.0002})`;
    lightsScroll(); roomsScroll();
    const k = $("#kopen").getBoundingClientRect();
    $("#stickyBuy").classList.toggle("show", y > 700 && !(k.top < innerHeight && k.bottom > 0));
  }
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll);

  // ---------- hoofdlus ----------
  let last = 0;
  function loop(ts) {
    aurora(ts);
    cx += (mx - cx) * 0.12; cy += (my - cy) * 0.12; cg.style.transform = `translate(${cx}px,${cy}px)`;
    if (demoVisible) {
      st += Math.min(0.05, (ts - last) / 1000 || 0.016);
      scenes[scene](st);
      if ((ts / 50 | 0) % 2 === 0) {
        const tg = sample(), dh = ((tg[0] - cur[0] + 540) % 360) - 180;
        cur = [(cur[0] + dh * 0.3 + 360) % 360, cur[1] + (tg[1] - cur[1]) * 0.3, cur[2] + (tg[2] - cur[2]) * 0.3];
        root.style.setProperty("--glow", `hsl(${cur[0] | 0},${cur[1] | 0}%,${cur[2] | 0}%)`);
        hudHex.textContent = hslHex(cur[0], cur[1], cur[2]);
      }
    }
    last = ts;
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // ---------- voor/na ----------
  const ba = $("#ba");
  const setBa = (x) => { const r = ba.getBoundingClientRect(); ba.style.setProperty("--x", clamp((x - r.left) / r.width, 0.02, 0.98) * 100 + "%"); };
  let drag = false;
  ba.addEventListener("pointerdown", (e) => { drag = true; ba.setPointerCapture(e.pointerId); setBa(e.clientX); });
  ba.addEventListener("pointermove", (e) => drag && setBa(e.clientX));
  ba.addEventListener("pointerup", () => (drag = false));
  // kleine hint-animatie als hij in beeld komt
  new IntersectionObserver((es, o) => {
    if (!es[0].isIntersecting || RM) return; o.disconnect();
    let t0 = performance.now();
    const hint = (t) => { const k = (t - t0) / 1600; if (k > 1 || drag) return; ba.style.setProperty("--x", 50 + Math.sin(k * Math.PI * 2) * 22 + "%"); requestAnimationFrame(hint); };
    requestAnimationFrame(hint);
  }, { threshold: 0.6 }).observe(ba);

  // ---------- hotspots ----------
  const card = $("#hsCard");
  $$(".hs").forEach((h) => {
    const show = () => {
      $("b", card).textContent = h.dataset.t; $("p", card).textContent = h.dataset.d;
      const L = parseFloat(h.style.left), T = parseFloat(h.style.top);
      card.style.left = L > 60 ? "" : `calc(${L}% + 30px)`; card.style.right = L > 60 ? `calc(${100 - L}% + 30px)` : "";
      card.style.top = `calc(${T}% - 30px)`; card.classList.add("show");
    };
    h.addEventListener("mouseenter", show); h.addEventListener("focus", show); h.addEventListener("click", show);
    h.addEventListener("mouseleave", () => card.classList.remove("show"));
  });

  // ---------- tellers ----------
  const counters = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; counters.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, t0 = performance.now(), dur = 1600;
    const fmt = (v) => (el.dataset.fmt === "k" ? (v >= 1000 ? Math.round(v / 1000) + "k" : v) : v);
    const step = (t) => { const k = clamp((t - t0) / dur); el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  $$("[data-count]").forEach((c) => counters.observe(c));

  // ---------- sfeerkiezer ----------
  $$("#swatches button").forEach((b, i) => {
    if (i === 2) b.classList.add("on");
    b.addEventListener("click", () => { $$("#swatches button").forEach((x) => x.classList.remove("on")); b.classList.add("on"); setMood(b.dataset.c); });
  });
  setMood("#be46ff");

  // ---------- tilt + magneet ----------
  if (matchMedia("(hover:hover)").matches && !RM) {
    $$(".tilt").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(0)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });
    $$(".magnet").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px,${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });
  }

  // ---------- reveal ----------
  const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("in"), io.unobserve(e.target))), { threshold: 0.12 });
  $$(".reveal").forEach((el, i) => { el.style.transitionDelay = (i % 3) * 0.08 + "s"; io.observe(el); });

  // ---------- maat & prijzen ----------
  let size = "4m";
  function render() {
    const p = PRODUCTS[size];
    $$('[data-price="single"]').forEach((e) => (e.textContent = eur(p.single.price)));
    $$('[data-price="duo"]').forEach((e) => (e.textContent = eur(p.duo.price)));
    $$("[data-save]").forEach((e) => (e.textContent = eur(p.single.price * 2 - p.duo.price)));
    $$(".buy").forEach((a) => { const o = p[a.dataset.pack]; a.href = `${SHOP}/cart/${o.variant}:${o.qty}`; });
  }
  $$(".size").forEach((b) => b.addEventListener("click", () => {
    $$(".size").forEach((x) => { x.classList.remove("active"); x.setAttribute("aria-checked", "false"); });
    b.classList.add("active"); b.setAttribute("aria-checked", "true"); size = b.dataset.size; render();
  }));
  render();

  $("#replayIntro")?.addEventListener("click", (e) => { e.preventDefault(); try { sessionStorage.removeItem("haloIntro"); } catch (_) {} location.reload(); });
  onScroll();
})();
