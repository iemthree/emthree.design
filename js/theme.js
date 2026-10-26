/* theme.js — light / dark theme for site v2 (Figma Theme modes Light 217:1322 / Dark 217:480).
   The <head> bootstrap already put data-theme on <html> before the first paint (stored choice, else the OS preference).
   PF.theme.toggle(originEl) switches with the repaint wave (see css/theme.css). The choice is kept in localStorage
   ("pf-theme"); until the visitor chooses, the page follows the OS setting live. */
(function () {
  "use strict";
  var PF = (window.PF = window.PF || {});
  var doc = document, root = doc.documentElement, KEY = "pf-theme";
  var DUR = 1150;                                    // ms; owner 2026-10-20: «немного замедли под конец» (was 900)
  var POINTS = 150, FRAMES = 44;
  var mqDark = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var mqReduce = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var META = { light: "#E1E7F1", dark: "#1A1C1F" };  // bg/page per mode
  // busy: a wave is running. heading: the theme it goes to. pending: the latest choice made during it (applied right after).
  // Clicks reach the controls during a wave (theme.css: ::view-transition is pointer-transparent; review F03), so choices made
  // mid-wave queue instead of changing the page under the running transition (review F04: the stored and shown theme disagreed).
  var busy = false, heading = null, pending = null, pendingOrigin = null;
  // wave variant: "a" = arc from the toggle (default), "b" = diagonal front across the page (?wave=b, plan extra a)
  var VARIANT = /[?&]wave=b\b/.test(location.search) ? "b" : "a";

  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function current() { return root.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  function apply(t) {
    root.setAttribute("data-theme", t);
    var m = doc.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", META[t]);
    doc.dispatchEvent(new CustomEvent("pf:theme", { detail: { theme: t } }));
  }
  function motionOk() {
    if (mqReduce && mqReduce.matches) return false;
    if (PF.motion && !PF.motion.enabled()) return false;
    var sc = doc.querySelector("[data-scene]"); if (sc && sc.classList.contains("fx-off")) return false;   // weak-device guard
    return true;
  }
  // timing: cubic-bezier(0.45, 0.1, 0.3, 1) — a quick entry and a longer, soft landing (owner: «немного замедли под конец»)
  function bez(x1, y1, x2, y2) {
    function a(p1, p2) { return 1 - 3 * p2 + 3 * p1; } function b(p1, p2) { return 3 * p2 - 6 * p1; } function c(p1) { return 3 * p1; }
    function at(t, p1, p2) { return ((a(p1, p2) * t + b(p1, p2)) * t + c(p1)) * t; }
    function slope(t, p1, p2) { return 3 * a(p1, p2) * t * t + 2 * b(p1, p2) * t + c(p1); }
    return function (x) { if (x <= 0) return 0; if (x >= 1) return 1; var t = x;
      for (var i = 0; i < 8; i++) { var s = slope(t, x1, x2); if (Math.abs(s) < 1e-6) break; t -= (at(t, x1, x2) - x) / s; }
      return at(Math.min(1, Math.max(0, t)), y1, y2); };
  }
  var ease = bez(0.45, 0.1, 0.3, 1);
  function smooth(e0, e1, x) { var t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }

  /* Geometry. The new theme is a disc whose centre sits OUTSIDE the page, behind the toggle, so even the first frame
     enters as a broad arc — a wave front, not a growing blob (owner 2026-10-20, screenshot). Its edge carries a long,
     travelling swell (wavelength ~ 560 px along the edge) that calms down before the end. Variant b: a straight front
     that sweeps along the page diagonal, same swell. */
  function geometry(origin) {
    var w = window.innerWidth, h = window.innerHeight, ox = w - 60, oy = 46;
    if (origin && origin.getBoundingClientRect) { var r = origin.getBoundingClientRect(); ox = r.left + r.width / 2; oy = r.top + r.height / 2; }
    var diag = Math.hypot(w, h), amp = Math.max(10, Math.min(26, diag * 0.014));
    var dx = ox - w / 2, dy = oy - h / 2, dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;   // outward, from the page centre to the toggle
    var g = { w: w, h: h, ox: ox, oy: oy, amp: amp, lambda: Math.max(380, Math.min(620, diag * 0.32)) };
    if (VARIANT === "b") {
      g.nx = -dx; g.ny = -dy;                          // the front travels from the toggle corner towards the opposite one
      var proj = [[0, 0], [w, 0], [0, h], [w, h]].map(function (c) { return (c[0] - ox) * g.nx + (c[1] - oy) * g.ny; });
      g.d0 = Math.min.apply(null, proj) - amp * 2; g.d1 = Math.max.apply(null, proj) + 8;
      return g;
    }
    var D = Math.max(320, Math.min(900, diag * 0.42));
    g.cx = ox + dx * D; g.cy = oy + dy * D;
    var near = Math.hypot(Math.max(0, Math.max(-g.cx, g.cx - w)), Math.max(0, Math.max(-g.cy, g.cy - h)));   // distance to the page box
    var far = Math.max.apply(null, [[0, 0], [w, 0], [0, h], [w, h]].map(function (c) { return Math.hypot(c[0] - g.cx, c[1] - g.cy); }));
    g.R0 = Math.max(0, near - amp * 2); g.R1 = far + 8;              // the swell is calm at the end, so the edge lands right on the far corner
    var angs = [[0, 0], [w, 0], [0, h], [w, h]].map(function (c) { return Math.atan2(c[1] - g.cy, c[0] - g.cx); });
    var base = Math.atan2(h / 2 - g.cy, w / 2 - g.cx);
    var rel = angs.map(function (a) { var d = a - base; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return d; });
    var spread = Math.max(Math.abs(Math.min.apply(null, rel)), Math.abs(Math.max.apply(null, rel)));
    g.a0 = base - spread - 0.25; g.a1 = base + spread + 0.25;
    return g;
  }
  function swell(g, s, p) {                         // edge offset at arc position s (px) for progress p
    var k = 2 * Math.PI / g.lambda, ph = p * 7.0;
    var env = 1 - smooth(0.68, 0.98, p);            // a wave from the first frame, calm at the end
    return g.amp * env * (Math.sin(k * s - ph) + 0.38 * Math.sin(k * 1.9 * s + ph * 1.35 + 1.1));
  }
  function edge(g, p, off0) {                       // the front as a list of points, in page px (off0: shift along its normal)
    var pts = [], e = ease(p); off0 = off0 || 0;
    if (VARIANT === "b") {
      var d = g.d0 + (g.d1 - g.d0) * e, tx = -g.ny, ty = g.nx, L = Math.hypot(g.w, g.h) * 1.2;
      for (var i = 0; i < POINTS; i++) { var s = -L + 2 * L * i / (POINTS - 1), off = d + off0 + swell(g, s, p);
        pts.push([g.ox + g.nx * off + tx * s, g.oy + g.ny * off + ty * s]); }
      return pts;
    }
    var R = g.R0 + (g.R1 - g.R0) * e, Rref = (g.R0 + g.R1) / 2;
    for (var j = 0; j < POINTS; j++) { var a = g.a0 + (g.a1 - g.a0) * j / (POINTS - 1), r = Math.max(0, R + off0 + swell(g, a * Rref, p));
      pts.push([g.cx + Math.cos(a) * r, g.cy + Math.sin(a) * r]); }
    return pts;
  }
  function polygon(g, p) {                          // the revealed region: the front plus the side it came from
    var pts = edge(g, p), extra;
    if (VARIANT === "b") { var L = Math.hypot(g.w, g.h) * 2; extra = [[pts[POINTS - 1][0] - g.nx * L, pts[POINTS - 1][1] - g.ny * L], [pts[0][0] - g.nx * L, pts[0][1] - g.ny * L]]; }
    else extra = [[g.cx, g.cy]];
    return "polygon(" + pts.concat(extra).map(function (q) { return q[0].toFixed(1) + "px " + q[1].toFixed(1) + "px"; }).join(",") + ")";
  }
  function band(g, p, width, k) {                   // a closed strip around the front, `width` px wide, in the 1/k layer's px
    var fwd = edge(g, p, width / 2), back = edge(g, p, -width / 2).reverse(); k = k || 1;
    return "polygon(" + fwd.concat(back).map(function (q) { return (q[0] / k).toFixed(2) + "px " + (q[1] / k).toFixed(2) + "px"; }).join(",") + ")";
  }
  /* The rim (owner 2026-10-20: «контур шире и сам край более размытый») — no large CSS filters. A full-screen blurred view-transition
     layer (filter: blur on the pseudo, or on a captured element) made Chrome flash rectangles of the OLD theme near the end of the wave at 2x DPR
     (owner screen recording 2026-10-20 20:13; reproduced headed at 1728x926: 5-17 flash frames per 6 switches with blur, 0 without).
     So the softness is drawn, not filtered:
     - haze: a 1/4-size layer scaled x4 whose background is a radial (variant b: linear) gradient ring around the front's base
       circle, Gaussian profile of the old blur (58 px band, 26 px blur); the ring radius is a registered property (--tw-r) animated
       by WAAPI, so it moves smoothly without new paint work per frame beyond one small gradient;
     - core: one 12 px strip on a 1/2-size layer, blurred 3 px there (= the old 6 px). A small blur on a small layer is cheap;
       the 26 px full-screen haze blur was what made Chrome drop tiles (A/B, headed 1728x926 @122 Hz: blurred haze 5-17 flash
       frames per run; drawn haze + this core 0 in 5 runs).
     Layers are transparent elements present in both states (WebKit shows no ::view-transition-new for an element added only in
     the update callback, f1). */
  var HAZE_K = 4;                                         // haze layer scale (the gradient is soft, so 1/4 resolution is invisible)
  var CORE = [{ pseudo: "new", half: 6 }], CORE_K = 2;
  function rimLayers(target, g) {
    root.style.setProperty("--tw-rim-rgb", target === "dark" ? "242 182 107" : "255 255 255");   // accent/brand (dark) / white (light)
    if (VARIANT === "b") {
      var ang = Math.atan2(g.nx, -g.ny), L = Math.abs(g.w * Math.sin(ang)) + Math.abs(g.h * Math.cos(ang));
      g.gStart = (g.w / 2 - g.ox) * g.nx + (g.h / 2 - g.oy) * g.ny - L / 2;   // front offset at the gradient line's start
      root.style.setProperty("--tw-ang", (ang * 180 / Math.PI).toFixed(2) + "deg");
    } else {
      root.style.setProperty("--tw-cx", (g.cx / HAZE_K).toFixed(2) + "px"); root.style.setProperty("--tw-cy", (g.cy / HAZE_K).toFixed(2) + "px");
    }
    root.classList.toggle("tw-wave-b", VARIANT === "b");
    return ["tw-haze", "tw-core"].map(function (name) { var d = doc.createElement("div"); d.className = "tw-rim " + name; d.setAttribute("aria-hidden", "true");
      var k = name === "tw-haze" ? HAZE_K : CORE_K; d.style.width = (window.innerWidth / k).toFixed(2) + "px"; d.style.height = (window.innerHeight / k).toFixed(2) + "px"; return d; });
  }
  function rimFade(p) { return smooth(0, 0.06, p) * (1 - smooth(0.78, 1, p)); }
  function hazeFrames(g) {                          // the base front (no swell) in the haze layer's px
    var out = [];
    for (var k = 0; k <= FRAMES; k++) { var p = k / FRAMES, e = ease(p), r;
      if (VARIANT === "b") r = g.d0 + (g.d1 - g.d0) * e - g.gStart; else r = g.R0 + (g.R1 - g.R0) * e;
      out.push({ "--tw-r": (r / HAZE_K).toFixed(2) + "px", opacity: +rimFade(p).toFixed(3) }); }
    return out;
  }
  function coreFrames(g, c, withFade) {
    var out = [];
    for (var k = 0; k <= FRAMES; k++) { var p = k / FRAMES, f = { clipPath: band(g, p, c.half * 2, CORE_K) };
      if (withFade) f.opacity = +(0.9 * rimFade(p)).toFixed(3); out.push(f); }
    return out;
  }
  function set(t, opts) {
    opts = opts || {};
    if (t !== "light" && t !== "dark") return;
    if (opts.remember !== false) { try { localStorage.setItem(KEY, t); } catch (e) {} }
    if (busy) { pending = t === heading ? null : t; pendingOrigin = opts.origin || pendingOrigin; return; }
    if (t === current()) return;
    var instant = opts.instant || !motionOk();
    if (instant) { apply(t); return; }
    if (!doc.startViewTransition) {                // fallback: colour cross-fade
      root.classList.add("theme-fade"); apply(t);
      setTimeout(function () { root.classList.remove("theme-fade"); }, 480);
      return;
    }
    var g = geometry(opts.origin), layers = rimLayers(t, g), frames = [];
    for (var k = 0; k <= FRAMES; k++) frames.push({ clipPath: polygon(g, k / FRAMES) });
    var hf = hazeFrames(g), cf = CORE.map(function (c, i) { return coreFrames(g, c, i === 0); });
    busy = true; heading = t;
    // the (transparent) layers exist in both states: WebKit shows no ::view-transition-new for an element added only in the
    // update callback (measured f1). Their colour is the pseudo's background (theme.css), so the page itself never shows it.
    layers.forEach(function (l) { doc.body.appendChild(l); });
    var vt = doc.startViewTransition(function () { apply(t); });
    doc.addEventListener("click", forwardClick, true);
    var done = false;
    function cleanup() {
      if (done) return; done = true; busy = false; heading = null; doc.removeEventListener("click", forwardClick, true);
      layers.forEach(function (l) { if (l.parentNode) l.parentNode.removeChild(l); });
      if (pending) { var next = pending, from = pendingOrigin; pending = null; pendingOrigin = null;
        if (next !== current()) requestAnimationFrame(function () { set(next, { origin: from, remember: false }); }); }
    }
    vt.ready.then(function () {
      var o = { duration: DUR, easing: "linear", fill: "both" };
      try {
        root.animate(frames, Object.assign({ pseudoElement: "::view-transition-new(root)" }, o));
        root.animate(hf, Object.assign({ pseudoElement: "::view-transition-new(tw-haze)" }, o));
        CORE.forEach(function (c, i) { root.animate(cf[i], Object.assign({ pseudoElement: "::view-transition-" + c.pseudo + "(tw-core)" }, o)); });
      } catch (e) {}
    }, cleanup);
    vt.finished.then(cleanup, cleanup);
  }
  /* During a view transition every hit lands on <html> (the spec routes pointer input to the document element while the
     pseudo-element tree is shown; pointer-events on ::view-transition does not change that in Chrome, measured f5). So a click on
     the header controls during the 1.15 s wave is handed to the control under the pointer (review F03): music toggles at once,
     a theme choice queues (set() above). */
  function forwardClick(e) {
    if (e.target !== root) return;
    var c = doc.querySelectorAll("[data-hc] button"), x = e.clientX, y = e.clientY;
    for (var i = 0; i < c.length; i++) { var r = c[i].getBoundingClientRect(), cs = getComputedStyle(c[i]);
      if (r.width && cs.visibility !== "hidden" && cs.pointerEvents !== "none" && +cs.opacity > 0.2 && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        e.preventDefault(); e.stopPropagation(); c[i].click(); return; } }
  }
  function wanted() { return pending || heading || current(); }   // where the page is going, counting queued choices
  function toggle(origin) { set(wanted() === "dark" ? "light" : "dark", { origin: origin }); }

  // follow the OS while the visitor has not chosen
  if (mqDark && mqDark.addEventListener) mqDark.addEventListener("change", function (e) { if (!stored()) set(e.matches ? "dark" : "light", { remember: false }); });
  PF.theme = { get: current, set: set, toggle: toggle, stored: stored, _polygon: function (o, p) { return polygon(geometry(o), p); }, variant: VARIANT, duration: DUR };
  apply(current());
})();
