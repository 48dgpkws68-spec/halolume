// Halolume · live kleur-sync demo + bestellen
(() => {
  // Shopify-winkel 3: vul domein en variant-ID's in zodra de producten bestaan
  const SHOP = "https://[SHOPIFY-DOMEIN].myshopify.com";
  const PRODUCTS = {
    "4m": { single: { price: 29.99, variant: "[VARIANT-4M]", qty: 1 }, duo: { price: 49.99, variant: "[VARIANT-4M]", qty: 2 } },
    "5m": { single: { price: 34.99, variant: "[VARIANT-5M]", qty: 1 }, duo: { price: 59.99, variant: "[VARIANT-5M]", qty: 2 } },
  };
  const eur = (n) => "€" + n.toFixed(2).replace(".", ",");

  // ---------- canvas-scènes ----------
  const cv = document.getElementById("screen");
  const ctx = cv.getContext("2d", { willReadFrequently: true });
  const W = cv.width, H = cv.height;
  const root = document.documentElement;
  const halo = document.getElementById("halo");
  const floor = document.getElementById("floor");
  const tag = document.getElementById("sceneTag");
  let scene = "film", t = 0;

  const scenes = {
    film(t) { // zonsondergang die overgaat in nachtscène met explosie
      const p = (t % 12) / 12;
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      const hue = 20 + Math.sin(t * 0.3) * 20 + (p > 0.5 ? 200 : 0);
      sky.addColorStop(0, `hsl(${hue},80%,${p > 0.5 ? 12 : 45}%)`);
      sky.addColorStop(1, `hsl(${hue + 20},90%,${p > 0.5 ? 25 : 60}%)`);
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      const sx = W * 0.5 + Math.sin(t * 0.4) * 60, sy = H * (0.45 + 0.1 * Math.sin(t * 0.2));
      const r = p > 0.5 && (t % 4) < 0.8 ? 120 * ((t % 4) / 0.8) : 34;
      const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
      sun.addColorStop(0, p > 0.5 ? "#fff3c0" : "#ffe9a8"); sun.addColorStop(0.4, p > 0.5 ? "#ff6a00" : "#ff8a3d"); sun.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = sun; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#05050a";
      for (let i = 0; i < 9; i++) { const bx = ((i * 41 + t * 8) % (W + 40)) - 40, bh = 30 + (i * 37 % 50); ctx.fillRect(bx, H - bh, 30, bh); }
    },
    game(t) { // neon-racebaan
      ctx.fillStyle = "#07001a"; ctx.fillRect(0, 0, W, H);
      const hue = (t * 40) % 360;
      for (let i = 0; i < 14; i++) {
        const z = ((i / 14 + t * 0.6) % 1), y = H * 0.5 + z * z * H * 0.5;
        ctx.strokeStyle = `hsla(${hue + i * 8},100%,60%,${z})`; ctx.lineWidth = 1 + z * 3;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      for (let k = -4; k <= 4; k++) { ctx.strokeStyle = `hsla(${hue + 120},100%,60%,.6)`; ctx.beginPath(); ctx.moveTo(W / 2, H * 0.5); ctx.lineTo(W / 2 + k * 90, H); ctx.stroke(); }
      const g = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, 70);
      g.addColorStop(0, `hsl(${hue + 60},100%,70%)`); g.addColorStop(1, "transparent");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = `hsl(${hue + 180},100%,60%)`; ctx.fillRect(W / 2 - 18 + Math.sin(t * 2) * 50, H - 40, 36, 16);
    },
    sport(t) { // groen veld met stadionlicht
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, "#0b1d3a"); g.addColorStop(0.35, "#1d6b2c"); g.addColorStop(1, "#2fa344");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(W / 2, H * 0.72, 70, 22, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(W / 2, H * 0.38); ctx.lineTo(W / 2, H); ctx.stroke();
      for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? "#ff7a00" : "#ffffff"; ctx.beginPath(); ctx.arc((i * 61 + t * 30 * (i % 2 ? 1 : -1)) % W, H * (0.55 + (i % 3) * 0.12), 5, 0, 7); ctx.fill(); }
      if ((t % 6) > 5) { ctx.fillStyle = `rgba(255,140,0,${1 - ((t % 6) - 5)})`; ctx.fillRect(0, 0, W, H); }
    },
    music(t) { // equalizer
      ctx.fillStyle = "#0a0014"; ctx.fillRect(0, 0, W, H);
      const n = 24, bw = W / n;
      for (let i = 0; i < n; i++) {
        const h = (0.3 + 0.7 * Math.abs(Math.sin(t * 3 + i * 0.6) * Math.cos(t * 1.3 + i))) * H * 0.85;
        ctx.fillStyle = `hsl(${(i * 12 + t * 60) % 360},100%,60%)`; ctx.fillRect(i * bw + 2, H - h, bw - 4, h);
      }
    },
    cozy(t) { // haardvuur
      ctx.fillStyle = "#120500"; ctx.fillRect(0, 0, W, H);
      for (let i = 0; i < 40; i++) {
        const x = W / 2 + Math.sin(i * 7.1 + t * 2) * 80, y = H - ((i * 13 + t * 60) % H);
        const g = ctx.createRadialGradient(x, y, 0, x, y, 40);
        g.addColorStop(0, `rgba(255,${120 + (i % 5) * 20},20,.5)`); g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.fillRect(x - 40, y - 40, 80, 80);
      }
    },
  };

  // gemiddelde kleur van de bovenrand/midden (waar de sensor kijkt)
  function sample() {
    const d = ctx.getImageData(0, 0, W, H).data;
    let r = 0, g = 0, b = 0, n = 0;
    for (let i = 0; i < d.length; i += 4 * 37) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
    r /= n; g /= n; b /= n;
    // naar HSL en verzadigen, zoals een ledstrip kleur weergeeft
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d0 = mx - mn;
    let h = 0;
    if (d0) h = mx === r ? ((g - b) / d0) % 6 : mx === g ? (b - r) / d0 + 2 : (r - g) / d0 + 4;
    h = (h * 60 + 360) % 360;
    const sat = d0 < 0.04 ? 20 : 100, light = Math.max(28, Math.min(60, mx * 70));
    return [h, sat, light];
  }

  let cur = [235, 100, 55];
  function loop() {
    t += 1 / 60;
    scenes[scene](t);
    if ((t * 60 | 0) % 3 === 0) {
      const tgt = sample();
      let dh = ((tgt[0] - cur[0] + 540) % 360) - 180; // kortste weg rond de kleurcirkel
      cur = [(cur[0] + dh * 0.3 + 360) % 360, cur[1] + (tgt[1] - cur[1]) * 0.3, cur[2] + (tgt[2] - cur[2]) * 0.3];
      const c = `hsl(${cur[0] | 0},${cur[1] | 0}%,${cur[2] | 0}%)`;
      floor.style.background = c;
      root.style.setProperty("--glow", c);
    }
    requestAnimationFrame(loop);
  }
  loop();

  const names = { film: "Film", game: "Gamen", sport: "Voetbal", music: "Muziek", cozy: "Gezellig" };
  document.querySelectorAll(".chip").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach((x) => x.classList.remove("active"));
    b.classList.add("active"); scene = b.dataset.scene; tag.textContent = names[scene];
    if (window.innerWidth < 900) document.getElementById("stage").scrollIntoView({ behavior: "smooth", block: "center" });
  }));
  // hero wisselt zelf van scène tot iemand kiest
  let auto = setInterval(() => {
    const keys = Object.keys(scenes); scene = keys[(keys.indexOf(scene) + 1) % keys.length]; tag.textContent = names[scene];
    document.querySelectorAll(".chip").forEach((x) => x.classList.toggle("active", x.dataset.scene === scene));
  }, 7000);
  document.querySelector(".chips").addEventListener("click", () => clearInterval(auto), { once: true });

  // ---------- maat & prijzen ----------
  let size = "4m";
  function render() {
    const p = PRODUCTS[size];
    document.querySelectorAll('[data-price="single"]').forEach((e) => (e.textContent = eur(p.single.price)));
    document.querySelectorAll('[data-price="duo"]').forEach((e) => (e.textContent = eur(p.duo.price)));
    document.querySelectorAll("[data-save]").forEach((e) => (e.textContent = eur(p.single.price * 2 - p.duo.price)));
    document.querySelectorAll(".buy").forEach((a) => {
      const o = p[a.dataset.pack];
      a.href = `${SHOP}/cart/${o.variant}:${o.qty}`;
    });
  }
  document.querySelectorAll(".size").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll(".size").forEach((x) => { x.classList.remove("active"); x.setAttribute("aria-checked", "false"); });
    b.classList.add("active"); b.setAttribute("aria-checked", "true"); size = b.dataset.size; render();
  }));
  render();

  // ---------- reveal + sticky ----------
  const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && e.target.classList.add("in")), { threshold: 0.12 });
  document.querySelectorAll(".section-head,.card,.chips").forEach((el) => { el.classList.add("reveal"); io.observe(el); });
  const sticky = document.getElementById("stickyBuy"), kopen = document.getElementById("kopen");
  addEventListener("scroll", () => {
    const k = kopen.getBoundingClientRect();
    sticky.classList.toggle("show", scrollY > 600 && !(k.top < innerHeight && k.bottom > 0));
  }, { passive: true });
})();
