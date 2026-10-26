/* hero-video.js — looping hero video (owner's Earth EX robot loop) + light overlays.
   Robot eye: data-eye holds the eye position for every frame of the loop (tools/track_eye.py). The glow sits on it
   each presented video frame, leans towards the cursor, sends a soft beam to it and brightens as it comes close,
   blinks now and then;
   a click on the robot flashes it and sends a ring from the eye.
   The video is decorative: a poster image (its first frame) is shown until the video plays, and it is the only
   thing shown with Motion off / prefers-reduced-motion (the video is then never loaded). One rAF loop draws the
   overlays in video pixels (1440x1088): water glints and birds behind the colour tint, sun motes in front.
   Playback and the loop stop when the hero is off-screen, the tab is hidden or Motion is off. */
(function () {
  "use strict";
  var PF = (window.PF = window.PF || {});
  var VW = 1440, VH = 1088;
  var GLINTS = [[439,586],[398,508],[392,464],[244,617],[421,775],[575,443],[358,623],[430,458],[286,477],[336,721],[290,607],[532,809],[363,737],[605,449],[318,591],[584,823],[420,733],[468,795],[227,479],[446,518],[350,446],[343,476],[394,589],[261,495],[455,558],[420,699],[419,631],[322,635],[222,595],[354,590],[431,488],[537,443],[365,693],[696,793],[461,490],[223,538],[464,456],[416,562],[370,562],[388,630],[333,563],[289,507],[279,637],[363,522]];
  function ready(fn) { if (document.readyState !== "loading") fn(); else document.addEventListener("DOMContentLoaded", fn); }
  function rand(a, b) { return a + Math.random() * (b - a); }

  ready(function () {
    var scene = document.querySelector("[data-scene]");
    if (!scene) return;
    var media = scene.querySelector("[data-media]"), video = scene.querySelector("video");
    var back = scene.querySelector("[data-fx=back]"), front = scene.querySelector("[data-fx=front]");
    var bctx = back && back.getContext ? back.getContext("2d") : null, fctx = front && front.getContext ? front.getContext("2d") : null;
    var hero = scene.closest(".hero") || document.body;
    var glow = scene.querySelector("[data-glow]"), ring = scene.querySelector("[data-ring]"), status = scene.querySelector("[data-scene-status]");
    var track = null;
    try { track = JSON.parse(media.getAttribute("data-eye") || "null"); } catch (e) { track = null; }
    var EYE = track ? track.eye : null, NF = track ? track.frames : 0, FPS = track ? track.fps : 24;
    // click target around the eye, in loop px (the robot faces left: body and legs are right of and below the eye)
    var HIT = { left: -45, right: 185, top: -70, bottom: 160 };
    var st = { t: 0, last: 0, raf: 0, running: false, visible: true, k: 1, dpr: 1, pointer: null, birds: [], birdsAt: 2.5, motes: [], loaded: false, srcs: null, srcIdx: 0,
      eye: EYE ? EYE[0] : null, look: [0, 0], near: 0, blink: 1, blinkAt: 2.5, blinkSeq: 0, flash: 0,
      dir: [-0.99, 0.12], beamA: 0, beamLen: 160,
      touch: null, touchUntil: 0, gaze: null, gazeUntil: 0, gazeBird: null, gazeLast: -1 };
    var hasRVFC = !!(video && "requestVideoFrameCallback" in video);
    // the beam is drawn on a 1/4-resolution canvas and scaled up onto the front canvas: a soft, blurred beam (owner 2026-10-19
    // «сделай луч немного размытым, отдельные лучики сильно в глаза бросаются») without ctx.filter, which Safari lacks
    var BEAM_RES = 0.25, beamCan = document.createElement("canvas"), beamCtx = beamCan.getContext ? beamCan.getContext("2d") : null;
    // twelve nested cones, half-widths 2…35 % of the length, alphas from a smooth (two-Gaussian) cross profile: the steps are
    // small and the 1/4-resolution canvas smears them, so no single ray edge shows
    var CONES = (function () { var I = function (w) { return Math.exp(-Math.pow(w / 0.085, 2)) + 0.38 * Math.exp(-Math.pow(w / 0.2, 2)); }, out = [], prev = I(0);
      for (var i = 0; i < 12; i++) { var hw = 0.02 + 0.03 * i, cur = i === 11 ? 0 : I(hw + 0.015); out.push([hw, (prev - cur) * 1.62]); prev = cur; } return out; })();
    // «А»: with no mouse over the hero (phones, or the cursor elsewhere) the robot looks around by itself: things in front of it,
    // a passing flock, now and then its companion; «Б»: a finger on the hero is the cursor on touch screens
    var GAZE = [[740, 540, 3], [540, 455, 2], [430, 360, 2], [520, 760, 2], [650, 240, 1], [300, 630, 1], [1010, 360, 1]];
    var IDLE_BEAM = 0.3;
    // weak-device guard (owner 2026-10-19: «анимация работает всегда … только если устройство совсем слабое, чтоб оно само вырубалось»).
    // While the hero runs, the rAF interval is sampled in 3 s windows (the first 2 s after a start and gaps > 300 ms are skipped).
    // Two windows in a row with a median above 50 ms (under 20 fps; iOS Low Power Mode's 30 fps cap does not count) step down once:
    // 1 = lite (canvas at 1x, 24 motes, rays stop breathing), 2 = off (the whole page goes static: poster, no loops — PF.motion.set(false)).
    // Nothing is stored: the next visit measures again.
    var perf = { level: 0, win: [], winStart: 0, skipUntil: 0, strikes: 0, medians: [] }, PERF_SLOW = 50, PERF_WIN = 3000;
    function perfSample(now, raw) {
      if (perf.level >= 2 || now < perf.skipUntil || raw <= 0 || raw > 300) return;
      if (!perf.win.length) perf.winStart = now;
      perf.win.push(raw);
      if (now - perf.winStart < PERF_WIN || perf.win.length < 8) return;
      var s = perf.win.slice().sort(function (a, b) { return a - b; }), med = s[s.length >> 1];
      perf.win.length = 0; perf.medians.push(Math.round(med)); if (perf.medians.length > 12) perf.medians.shift();
      if (med > PERF_SLOW) { if (++perf.strikes >= 2) { perf.strikes = 0; perfStep(med, now); } } else perf.strikes = 0;
    }
    function perfStep(med, now) {
      perf.level++;
      if (perf.level === 1) {
        scene.classList.add("fx-lite"); if (st.motes.length > 24) st.motes.length = 24; measure(); perf.skipUntil = now + 1500;
      } else {
        scene.classList.add("fx-off"); PF.perfOff = true; if (PF.motion) PF.motion.set(false);
      }
      document.dispatchEvent(new CustomEvent("pf:perf", { detail: { level: perf.level, medianMs: Math.round(med) } }));
    }

    // main.js owns the motion preference and announces it with "pf:motion"; until then nothing loads or plays
    function motionOn() { return !!(PF.motion && PF.motion.enabled()); }

    /* ---------- video ---------- */
    function sourceList() {
      var small = window.matchMedia && window.matchMedia("(max-width: 899px)").matches;
      var raw = video.getAttribute(small ? "data-sources-small" : "data-sources") || video.getAttribute("data-sources") || "[]";
      var list; try { list = JSON.parse(raw); } catch (e) { list = []; }
      return list.filter(function (s) { return !s.type || video.canPlayType(s.type) !== ""; });
    }
    function load() {
      if (st.loaded || !video) return;
      // the poster is the LCP element: let it arrive before the 2-5 MB loop competes for bandwidth (Slow 4G: LCP 4.06 -> 3.64 s)
      var poster = scene.querySelector(".hv-poster");
      if (poster && !poster.complete && !st.waitPoster) { st.waitPoster = true; var go = function () { st.waitPoster = false; wake(); };   /* wake() re-checks motion / visibility (review F06) */ poster.addEventListener("load", go, { once: true }); poster.addEventListener("error", go, { once: true }); return; }
      if (st.waitPoster) return;
      var embedded = document.getElementById("pf-hero-video");
      if (embedded) {                         // standalone build: the video travels inside the HTML as base64
        try {
          var bin = atob(embedded.textContent.replace(/\s+/g, "")), u8 = new Uint8Array(bin.length);
          for (var i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
          video.src = URL.createObjectURL(new Blob([u8], { type: embedded.getAttribute("data-type") || "video/mp4" }));
        } catch (e) { scene.classList.add("video-failed"); return; }
      } else {
        st.srcs = sourceList();
        if (!st.srcs.length) { scene.classList.add("video-failed"); return; }
        video.src = st.srcs[0].src;
      }
      st.loaded = true;
      video.load();
    }
    if (video) {
      video.muted = true; video.defaultMuted = true;
      video.addEventListener("error", function () {
        if (st.srcs && st.srcIdx < st.srcs.length - 1) { st.srcIdx++; video.src = st.srcs[st.srcIdx].src; video.load(); play(); }
        else scene.classList.add("video-failed");
      });
      video.addEventListener("playing", function () { scene.classList.add("is-playing"); });
    }
    function play() { if (!video) return; var p = video.play(); if (p && p.catch) p.catch(function () {}); }

    /* ---------- overlays ---------- */
    function measure() {
      if (!media) return;
      var w = media.clientWidth || 1, h = media.clientHeight || 1;
      st.dpr = Math.min(window.devicePixelRatio || 1, perf.level ? 1 : 1.5);
      st.k = w / VW;
      placeEye();
      [back, front].forEach(function (c) {
        if (!c) return;
        var W = Math.round(w * st.dpr), H = Math.round(h * st.dpr);
        if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
      });
      if (front && beamCan) { var bw = Math.ceil(front.width * BEAM_RES), bh = Math.ceil(front.height * BEAM_RES); if (beamCan.width !== bw || beamCan.height !== bh) { beamCan.width = bw; beamCan.height = bh; } }
    }
    var sprite = null;
    function makeSprite() {
      var c = document.createElement("canvas"); c.width = c.height = 32;
      var g = c.getContext("2d"), gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, "rgba(255,240,205,1)"); gr.addColorStop(0.35, "rgba(255,240,205,0.45)"); gr.addColorStop(1, "rgba(255,240,205,0)");
      g.fillStyle = gr; g.fillRect(0, 0, 32, 32); return c;
    }
    function initMotes() {
      sprite = makeSprite(); st.motes = [];
      for (var i = 0; i < 58; i++) st.motes.push({ x: rand(560, 1440), y: rand(140, 1040), r: rand(1.1, 3.0),   // owner 2026-10-19: more motes, a bit more visible (34 -> 58, r +20 %, alpha 0.5 -> 0.68)
 vy: rand(-11, -4), ph: rand(0, 6.28), sp: rand(0.4, 1.1), z: rand(0.4, 1.4) });
    }
    function spawnBirds() {                   // a small flock crossing the visible sky band (video y 150-300)
      var n = 2 + Math.floor(Math.random() * 3), y = rand(160, 290), dir = Math.random() < 0.7 ? 1 : -1, x0 = dir > 0 ? 420 : 1500;
      for (var i = 0; i < n; i++) st.birds.push({ x: x0 - dir * i * rand(16, 30), y: y + rand(-12, 12) + i * 5, vx: dir * rand(52, 68), s: rand(5.2, 7.6), ph: rand(0, 6.28), f: rand(7, 9) });
      st.birdsAt = st.t + rand(10, 18);
    }
    function draw(dt) {
      var k = st.k * st.dpr, px = 0, py = 0;
      if (st.pointer) { px = (st.pointer[0] - 960) / VW; py = (st.pointer[1] - 560) / VH; }
      if (bctx) {
        bctx.setTransform(1, 0, 0, 1, 0, 0); bctx.clearRect(0, 0, back.width, back.height); bctx.setTransform(k, 0, 0, k, 0, 0);
        bctx.globalCompositeOperation = "lighter";
        for (var i = 0; i < GLINTS.length; i++) {
          var g = GLINTS[i], s = Math.sin(st.t * (0.9 + (i % 7) * 0.13) + i * 2.17);
          if (s < 0.84) continue;
          var a = Math.pow((s - 0.84) / 0.16, 2) * 0.8;
          bctx.fillStyle = "rgba(255,246,214," + a.toFixed(3) + ")";
          bctx.fillRect(g[0] - 2.6, g[1] - 0.55, 5.2, 1.1); bctx.fillRect(g[0] - 0.55, g[1] - 1.3, 1.1, 2.6);
        }
        bctx.globalCompositeOperation = "source-over";
        if (st.t > st.birdsAt) spawnBirds();
        bctx.strokeStyle = "rgba(38,36,30,0.72)"; bctx.lineWidth = 1.4;   // owner 2026-10-19: birds a bit bigger (+23 %) and darker bctx.lineCap = "round";
        for (var b = st.birds.length - 1; b >= 0; b--) {
          var B = st.birds[b]; B.x += B.vx * dt; B.y += Math.sin(st.t * 0.7 + B.ph) * 0.9 * dt;
          if (B.x < 360 || B.x > 1560) { st.birds.splice(b, 1); continue; }
          var flap = Math.sin(st.t * B.f + B.ph), wy = B.s * (0.15 + 0.55 * flap);
          bctx.beginPath(); bctx.moveTo(B.x - B.s, B.y - wy); bctx.quadraticCurveTo(B.x - B.s * 0.45, B.y - wy * 0.2 - 0.7, B.x, B.y);
          bctx.quadraticCurveTo(B.x + B.s * 0.45, B.y - wy * 0.2 - 0.7, B.x + B.s, B.y - wy); bctx.stroke();
        }
      }
      if (fctx && sprite) {
        fctx.setTransform(1, 0, 0, 1, 0, 0); fctx.clearRect(0, 0, front.width, front.height); fctx.setTransform(k, 0, 0, k, 0, 0);
        fctx.globalCompositeOperation = "lighter";
        for (var j = 0; j < st.motes.length; j++) {
          var M = st.motes[j];
          M.y += M.vy * M.sp * dt; M.x += Math.sin(st.t * 0.6 * M.sp + M.ph) * 4.5 * dt;
          if (M.y < 100) { M.y = 1040; M.x = rand(560, 1440); }
          var tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(st.t * 1.7 * M.sp + M.ph));
          var mx = M.x - px * 26 * M.z, my = M.y - py * 16 * M.z, rr = M.r * 2.6;
          fctx.globalAlpha = 0.68 * tw; fctx.drawImage(sprite, mx - rr, my - rr, rr * 2, rr * 2);
        }
        fctx.globalAlpha = 1; fctx.globalCompositeOperation = "source-over";
      }
    }
    /* ---------- robot eye: glow + click target follow the presented video frame ---------- */
    function placeEye() {
      if (!st.eye) return;
      var x = (st.eye[0] + st.look[0]) * st.k, y = (st.eye[1] + st.look[1]) * st.k;
      var tr = "translate(" + x.toFixed(2) + "px," + y.toFixed(2) + "px)";
      if (glow) glow.style.transform = tr + " scale(" + (1 + 0.4 * st.near).toFixed(3) + ")";
      if (ring) ring.style.transform = "translate(" + (st.eye[0] * st.k).toFixed(2) + "px," + (st.eye[1] * st.k).toFixed(2) + "px)";
    }
    function setFrame(mediaTime) {
      if (!EYE) return;
      var f = Math.round(mediaTime * FPS) % NF;
      st.eye = EYE[f < 0 ? f + NF : f];
      placeEye();
    }
    function onVideoFrame(now, meta) { setFrame(meta.mediaTime); video.requestVideoFrameCallback(onVideoFrame); }
    if (hasRVFC && EYE) video.requestVideoFrameCallback(onVideoFrame);

    function eyeFx(dt) {
      if (!EYE || !glow) return;
      if (!hasRVFC && video && st.loaded) st.eye = EYE[Math.round(video.currentTime * FPS) % NF];
      // looks at the cursor: the halo leans up to 12 loop px towards it, a beam reaches out to it,
      // and both grow brighter as the cursor comes close
      var tx = 0, ty = 0, near = 0, beamT = 0, lenT = 160, dirT = null;
      var user = st.pointer || (st.touch && st.t < st.touchUntil ? st.touch : null), tgt = user || lookAround();
      if (tgt) {
        var dx = tgt[0] - st.eye[0], dy = tgt[1] - st.eye[1], d = Math.sqrt(dx * dx + dy * dy) || 1;
        tx = dx / d * 12; ty = dy / d * 8; near = user ? Math.max(0, 1 - d / 420) : 0;
        dirT = [dx / d, dy / d]; beamT = user ? 0.55 + 0.45 * near : IDLE_BEAM; lenT = Math.max(90, Math.min(320, d * 0.85));
      }
      var a = 1 - Math.exp(-(user ? 9 : 3.2) * dt);      // the robot's own glances are slower than following a hand
      st.look[0] += (tx - st.look[0]) * a; st.look[1] += (ty - st.look[1]) * a;
      st.near += (near - st.near) * (1 - Math.exp(-5 * dt));
      if (dirT) {                            // smooth the direction as a vector (no angle wrap), then renormalise
        st.dir[0] += (dirT[0] - st.dir[0]) * a; st.dir[1] += (dirT[1] - st.dir[1]) * a;
        var dl = Math.sqrt(st.dir[0] * st.dir[0] + st.dir[1] * st.dir[1]) || 1; st.dir[0] /= dl; st.dir[1] /= dl;
      }
      st.beamA += (beamT - st.beamA) * (1 - Math.exp(-6 * dt));
      st.beamLen += (lenT - st.beamLen) * a;
      // blinks (sometimes a double blink), as on the old rig
      if (st.t > st.blinkAt) {
        var bt = st.t - st.blinkAt, dur = 0.16;
        st.blink = bt < dur ? 1 - 0.9 * Math.sin(Math.PI * bt / dur) : 1;
        if (bt >= dur) {
          if (st.blinkSeq === 0 && Math.random() < 0.3) { st.blinkSeq = 1; st.blinkAt = st.t + 0.12; }
          else { st.blinkSeq = 0; st.blinkAt = st.t + rand(2.8, 6.5); }
        }
      }
      st.flash = Math.max(0, st.flash - dt * 1.4);
      var lid = 0.12 + 0.88 * (st.blink - 0.1) / 0.9;
      var op = (0.5 + 0.1 * Math.sin(st.t * 2.7) + 0.5 * st.near + 0.6 * st.flash) * lid;
      glow.style.opacity = Math.min(1, op).toFixed(3);
      placeEye();
      drawBeam(lid);
    }

    // «А»: pick something to look at for a couple of seconds; a flock in front of the robot wins most of the time and is followed
    function lookAround() {
      if (st.gazeBird && st.birds.indexOf(st.gazeBird) < 0) { st.gazeBird = null; st.gazeUntil = 0; }
      if (st.t >= st.gazeUntil) {
        st.gazeBird = null;
        var lead = null;
        for (var i = 0; i < st.birds.length; i++) { var B = st.birds[i]; if (B.x > 300 && B.x < 1000 && (!lead || Math.abs(B.x - 650) < Math.abs(lead.x - 650))) lead = B; }
        if (lead && Math.random() < 0.75) { st.gazeBird = lead; st.gazeUntil = st.t + rand(2.4, 4); }
        else {
          var sum = 0, j, pick = 0; for (j = 0; j < GAZE.length; j++) if (j !== st.gazeLast) sum += GAZE[j][2];
          var r = Math.random() * sum; for (j = 0; j < GAZE.length; j++) { if (j === st.gazeLast) continue; r -= GAZE[j][2]; if (r <= 0) { pick = j; break; } }
          st.gazeLast = pick; st.gaze = [GAZE[pick][0] + rand(-25, 25), GAZE[pick][1] + rand(-18, 18)]; st.gazeUntil = st.t + rand(1.8, 3.6);
        }
      }
      return st.gazeBird ? [st.gazeBird.x, st.gazeBird.y] : st.gaze;
    }

    // beam + bright pupil on the front canvas (draw() has just cleared it); four widening cones fake a soft edge,
    // the narrowest one is the bright core of the beam
    function drawBeam(lid) {
      if (!fctx || !st.eye || st.beamA < 0.01) return;
      var dx = st.dir[0], dy = st.dir[1], nx = -dy, ny = dx;
      // the eye is on the robot's left (front) face: aimed back over its own body the beam is mostly hidden,
      // so it fades and shortens there while the halo and pupil still lean towards the cursor
      var face = Math.max(0.2, Math.min(1, 0.35 - dx));
      var BEAM = 0.85;                       // overall beam strength (owner: -15% from the first version)
      var k = st.k * st.dpr, A = st.beamA * lid * face * BEAM, len = st.beamLen * (0.45 + 0.55 * face);
      var ex = st.eye[0], ey = st.eye[1];    // always from the lens centre (the track follows the lit lens)
      var fx = ex + dx * len, fy = ey + dy * len;
      var bc = beamCtx || fctx, ks = beamCtx ? k * BEAM_RES : k;
      if (beamCtx) { beamCtx.setTransform(1, 0, 0, 1, 0, 0); beamCtx.clearRect(0, 0, beamCan.width, beamCan.height); }
      bc.setTransform(ks, 0, 0, ks, 0, 0);
      bc.globalCompositeOperation = "lighter";
      // fades in over the first ~9% so the start is soft instead of a sharp apex at the lens
      var g = bc.createLinearGradient(ex, ey, fx, fy);
      g.addColorStop(0, "rgba(255,226,170,0)"); g.addColorStop(0.09, "rgba(255,226,170,0.9)");
      g.addColorStop(0.35, "rgba(255,180,85,0.55)"); g.addColorStop(1, "rgba(255,150,50,0)");
      bc.fillStyle = g;
      CONES.forEach(function (w) {                       // [half-width at the far end / length, alpha]
        var hw = len * w[0], h0 = 2 + 5 * (w[0] / 0.07);   // wider start: no needle point at the lens
        bc.globalAlpha = Math.min(1, A * w[1]);
        bc.beginPath();
        bc.moveTo(ex + nx * h0, ey + ny * h0); bc.lineTo(fx + nx * hw, fy + ny * hw);
        bc.lineTo(fx - nx * hw, fy - ny * hw); bc.lineTo(ex - nx * h0, ey - ny * h0);
        bc.closePath(); bc.fill();
      });
      bc.globalAlpha = 1; bc.globalCompositeOperation = "source-over";
      fctx.setTransform(1, 0, 0, 1, 0, 0);
      fctx.globalCompositeOperation = "lighter";
      if (beamCtx) { fctx.imageSmoothingEnabled = true; fctx.imageSmoothingQuality = "high"; fctx.drawImage(beamCan, 0, 0, front.width, front.height); }
      fctx.setTransform(k, 0, 0, k, 0, 0);
      // pupil: a soft bright spot that leans a little towards the cursor but stays inside the lens
      var cx = ex + st.look[0] * 0.45, cy = ey + st.look[1] * 0.45, rg = fctx.createRadialGradient(cx, cy, 0, cx, cy, 13);
      rg.addColorStop(0, "rgba(255,248,225,0.95)"); rg.addColorStop(0.45, "rgba(255,210,130,0.5)"); rg.addColorStop(1, "rgba(255,190,110,0)");
      fctx.globalAlpha = Math.min(1, (0.3 + st.beamA * lid) * BEAM); fctx.fillStyle = rg;
      fctx.beginPath(); fctx.arc(cx, cy, 13, 0, 6.2832); fctx.fill();
      fctx.globalAlpha = 1; fctx.globalCompositeOperation = "source-over";
    }

    function sayHi() {
      st.flash = 1;
      scene.classList.add("is-hi");
      clearTimeout(st.hiTimer);
      st.hiTimer = setTimeout(function () { scene.classList.remove("is-hi"); }, 1400);
      if (ring && motionOn()) { ring.classList.remove("is-on"); void ring.offsetWidth; ring.classList.add("is-on"); }
      if (status) { status.textContent = ""; status.textContent = "The robot says hi."; }
    }
    function toLoop(e) {
      var r = media.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width * VW, (e.clientY - r.top) / r.height * VH];
    }
    function overRobot(p) {
      var e = st.eye;
      return !!e && p[0] > e[0] + HIT.left && p[0] < e[0] + HIT.right && p[1] > e[1] + HIT.top && p[1] < e[1] + HIT.bottom;
    }

    function clearFx() { [bctx, fctx].forEach(function (c) { if (c) { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, c.canvas.width, c.canvas.height); } }); }

    // 60 fps cap (owner 2026-10-20, «1»): rAF follows the screen (120 Hz on ProMotion, 144 on gaming monitors); the loop is 24 fps
    // video + motes + beam, so frames past 60/s cost CPU/GPU and show nothing. `due` keeps the 60/s rhythm on any refresh rate;
    // the 4 ms slack (< half a 120 Hz frame) means a 60 Hz screen never skips.
    var FRAME_MS = 1000 / 60;
    function frame(now) {
      st.raf = 0;
      if (!st.running) return;
      if (st.due && now < st.due - 4) { st.raf = requestAnimationFrame(frame); return; }
      st.due = (!st.due || now - st.due > FRAME_MS) ? now + FRAME_MS : st.due + FRAME_MS;
      var raw = st.last ? now - st.last : 0, dt = st.last ? Math.min(raw / 1000, 0.05) : 0.016;   // clamp after tab switches
      st.last = now; st.t += dt;
      perfSample(now, raw);
      draw(dt);
      eyeFx(dt);
      st.raf = requestAnimationFrame(frame);
    }
    function wake() {
      var should = motionOn() && st.visible && !document.hidden;
      if (should) {
        load(); play();
        if (!st.running) { st.running = true; st.last = 0; st.due = 0; perf.win.length = 0; perf.skipUntil = performance.now() + 2000; measure(); st.raf = requestAnimationFrame(frame); }
      } else {
        if (video && !video.paused) video.pause();
        if (st.running) { st.running = false; if (st.raf) cancelAnimationFrame(st.raf); st.raf = 0; }
        if (!motionOn()) clearFx();
      }
      scene.classList.toggle("is-live", should);
    }

    /* ---------- inputs: the cursor nudges the motes (parallax) and is what the robot looks at; on touch screens a finger on the hero is ---------- */
    hero.addEventListener("pointermove", function (e) {
      if (e.pointerType !== "mouse" || !media) return;
      var r = media.getBoundingClientRect();
      st.pointer = [(e.clientX - r.left) / r.width * VW, (e.clientY - r.top) / r.height * VH];
    });
    hero.addEventListener("pointerleave", function () { st.pointer = null; });
    // «Б»: touch events (not pointer events) so the robot keeps following the finger while the page scrolls under it
    function touchAt(e) {
      var t = e.touches && e.touches[0]; if (!t || !media) return;
      var r = media.getBoundingClientRect(); st.touch = [(t.clientX - r.left) / r.width * VW, (t.clientY - r.top) / r.height * VH]; st.touchUntil = Infinity;
    }
    function touchEnd() { if (st.touch) st.touchUntil = st.t + 0.8; }
    hero.addEventListener("touchstart", touchAt, { passive: true });
    hero.addEventListener("touchmove", touchAt, { passive: true });
    hero.addEventListener("touchend", touchEnd, { passive: true });
    hero.addEventListener("touchcancel", touchEnd, { passive: true });
    if (media && EYE) {
      media.addEventListener("pointermove", function (e) { media.classList.toggle("is-over-robot", overRobot(toLoop(e))); });
      media.addEventListener("pointerleave", function () { media.classList.remove("is-over-robot"); });
      media.addEventListener("click", function (e) { if (overRobot(toLoop(e))) sayHi(); });
    }

    if ("IntersectionObserver" in window && media) {
      new IntersectionObserver(function (en) { st.visible = en[0].isIntersecting; wake(); }, { threshold: 0.02 }).observe(media);
    }
    document.addEventListener("visibilitychange", wake);
    document.addEventListener("pf:motion", wake);
    if (window.ResizeObserver && media) new ResizeObserver(measure).observe(media);
    window.addEventListener("resize", measure);

    measure(); initMotes(); scene.classList.add("is-ready");
    wake();
    PF.scene = { state: st, video: video, wake: wake, sayHi: sayHi, perf: perf };
  });
})();
