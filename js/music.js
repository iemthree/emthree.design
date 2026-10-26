/* music.js — background music button, off by default. Site v2: the Music toggle of the header controls (Figma MusicToggle 164:88:
   Off = round speaker 164:62, On = pill with the live dot + 6 bars 164:73); folding into Settings is js/controls.js.
   v1 header (owner's Figma 80:1605, 2026-10-19):
   The track (assets/audio/music.m4a, tools/make_music.py) already carries the owner's 30 % ceiling in its samples, so the element
   plays at volume 1 = 30 % everywhere, iOS included (there HTMLMediaElement.volume is read-only). Nothing is loaded before the first
   click. The 8 bars follow the music: PF_MUSIC (js/music-levels.js) holds 8 band levels per 1/20 s of the track, read against
   audio.currentTime — no Web Audio, so it also works from file:// (where an analyser would only hear silence).
   Bars move only while the music plays and the OS does not ask for reduced motion; otherwise they rest at the Figma heights. */
(function () {
  "use strict";
  var PF = (window.PF = window.PF || {});
  var doc = document;
  function ready(fn) { if (doc.readyState !== "loading") fn(); else doc.addEventListener("DOMContentLoaded", fn); }
  ready(function () {
    var btn = doc.querySelector("[data-music-toggle]"), audio = doc.querySelector("[data-music]");
    if (!btn || !audio || !audio.play) return;
    var bars = [].slice.call(btn.querySelectorAll(".music-bars i"));
    var REST = [8, 16, 10, 6, 8, 10], FULL = 22;   // Figma 164:73 bar heights, px (2 px bars in a 27 x 22 box)
    var MAP = [2, 0, 3, 5, 1, 4];                // bar -> band (60 Hz … 11 kHz), shuffled so neighbouring bars differ
    var M = window.PF_MUSIC || null, LV = M ? M.levels : "", NB = M ? M.bands : 8;
    var cur = REST.slice(), on = false, raf = 0, last = 0, due = 0, fader = 0;
    var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    function moving() { return !(mq && mq.matches) && !(PF.motion && !PF.motion.enabled()); }

    function load() {
      if (audio.getAttribute("src")) return;
      var emb = doc.getElementById("pf-music");      // standalone file: the track is embedded as base64
      if (emb) {
        var bin = atob(emb.textContent.trim()), n = bin.length, u8 = new Uint8Array(n);
        for (var i = 0; i < n; i++) u8[i] = bin.charCodeAt(i);
        audio.src = URL.createObjectURL(new Blob([u8], { type: emb.getAttribute("data-type") || "audio/mp4" }));
      } else audio.src = audio.getAttribute("data-src");
    }
    function level(b, t) {
      if (!M) return 0.5;
      var f = t * M.fps, i = Math.floor(f), u = f - i; i = i % M.frames; var j = (i + 1) % M.frames;
      return (parseInt(LV.charAt(i * NB + b), 36) * (1 - u) + parseInt(LV.charAt(j * NB + b), 36) * u) / 35;
    }
    function paint() { for (var i = 0; i < bars.length; i++) bars[i].style.height = cur[i].toFixed(2) + "px"; }
    function frame(now) {
      // 60 fps cap (owner 2026-10-20), same rule as js/hero-video.js: skip the extra frames of 120/144 Hz screens
      if (due && now < due - 4) { raf = requestAnimationFrame(frame); return; }
      due = (!due || now - due > 1000 / 60) ? now + 1000 / 60 : due + 1000 / 60;
      var dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016; last = now;
      var anim = on && !audio.paused && moving(), t = audio.currentTime || 0, settled = true;
      for (var i = 0; i < bars.length; i++) {
        var tgt = anim ? Math.max(3, Math.min(FULL, 0.3 * REST[i] + 0.7 * (4 + 18 * level(MAP[i], t)))) : REST[i];   // 30 % of the Figma silhouette + 70 % music
        var rate = tgt > cur[i] ? 28 : 11;           // quick attack, softer fall
        cur[i] += (tgt - cur[i]) * (1 - Math.exp(-rate * dt));
        if (Math.abs(cur[i] - REST[i]) > 0.05) settled = false;
      }
      paint();
      if (!anim && settled) { raf = 0; last = 0; due = 0; return; }
      raf = requestAnimationFrame(frame);
    }
    function loop() { if (!raf) { last = 0; due = 0; raf = requestAnimationFrame(frame); } }
    function fade(to, ms, done) {                    // volume ramp (no effect on iOS, where volume is fixed)
      clearInterval(fader); var from = audio.volume, t0 = Date.now();
      fader = setInterval(function () { var k = Math.min(1, (Date.now() - t0) / ms); try { audio.volume = from + (to - from) * k; } catch (e) {}
        if (k >= 1) { clearInterval(fader); if (done) done(); } }, 30);
    }
    function setState(v) {
      on = v; btn.setAttribute("aria-pressed", String(v)); btn.setAttribute("title", v ? "Music: on" : "Music: off");
      btn.classList.toggle("is-playing", v); loop();
    }
    function play() {
      load(); clearInterval(fader); try { audio.volume = 0; } catch (e) {}
      setState(true);
      var p = audio.play();
      if (p && p.then) p.then(function () { fade(1, 700); }, function () { setState(false); });
      else fade(1, 700);
    }
    function stop() { setState(false); fade(0, 350, function () { audio.pause(); }); }
    btn.addEventListener("click", function () { if (on) stop(); else play(); });
    audio.addEventListener("pause", function () { if (on && audio.volume > 0.05) setState(false); });   // paused by the system (call, other tab on iOS)
    audio.addEventListener("error", function () { setState(false); });
    if (mq && mq.addEventListener) mq.addEventListener("change", loop);
    doc.addEventListener("pf:motion", loop);
    btn.title = "Music: off"; paint();
    PF.music = { audio: audio, play: play, stop: stop, state: function () { return { on: on, heights: cur.slice() }; } };
  });
})();
