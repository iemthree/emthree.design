/* controls.js — the header controls group (owner 2026-10-20, Figma 217:1460 Music toggle off + 252:4866 Settings).
   States on .hc[data-state]: "open" = Theme toggle + Music toggle; "closed" = the Settings circle only.
   - top of the page: open, Settings is not shown;
   - the page is scrolled: closed (both toggles fold into Settings);
   - click / Enter / Space on Settings: open (Settings disappears, focus goes to the theme toggle);
   - a choice made while opened from Settings (theme or music): both fold back after the toggle's own animation;
   - Escape, a click outside, or scrolling on by 160 px: fold back.  Hysteresis at the top: 12 / 40 px. */
(function () {
  "use strict";
  var PF = (window.PF = window.PF || {});
  var doc = document;
  function ready(fn) { if (doc.readyState !== "loading") fn(); else doc.addEventListener("DOMContentLoaded", fn); }
  ready(function () {
    var hc = doc.querySelector("[data-hc]"); if (!hc) return;
    var themeBtn = hc.querySelector("[data-theme-toggle]"), musicBtn = hc.querySelector("[data-music-toggle]"), settings = hc.querySelector("[data-settings]");
    var state = "open", scrolled = false, openedAt = -1, foldTimer = 0, sraf = 0;
    function y() { return window.pageYOffset || doc.documentElement.scrollTop || 0; }
    function setState(s, why) {
      if (s === state) return;
      var hadFocus = hc.contains(doc.activeElement);
      state = s; hc.setAttribute("data-state", s);
      settings.setAttribute("aria-expanded", String(s === "open"));
      if (s === "open") { openedAt = why === "settings" ? y() : -1; if (hadFocus && why === "settings") setTimeout(function () { themeBtn.focus({ preventScroll: true }); }, 60); }
      else { openedAt = -1; if (hadFocus) setTimeout(function () { settings.focus({ preventScroll: true }); }, 60); }
      doc.dispatchEvent(new CustomEvent("pf:controls", { detail: { state: s, why: why || "" } }));
    }
    function foldSoon(ms) { clearTimeout(foldTimer); if (scrolled && openedAt >= 0) foldTimer = setTimeout(function () { if (scrolled) setState("closed", "choice"); }, ms); }
    /* brand: split the name into letters once (the link keeps its aria-label), fold it while scrolled */
    var brand = doc.querySelector(".brand"), bname = brand && brand.querySelector(".brand-name");
    if (bname && !bname.querySelector(".bn-ch")) {
      var txt = bname.textContent, n = txt.length; bname.textContent = "";
      for (var i = 0; i < n; i++) { var sp = doc.createElement("span"); sp.className = "bn-ch"; sp.textContent = txt[i]; sp.style.setProperty("--i", i); sp.style.setProperty("--n", n - 1); bname.appendChild(sp); }
      bname.style.setProperty("--bn-w", Math.ceil(bname.scrollWidth + 4) + "px");
    }
    if (brand) brand.addEventListener("click", function (e) {      // back to the hero, smoothly when motion is allowed
      e.preventDefault();
      var smooth = !(PF.motion && !PF.motion.enabled());
      window.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
      if (history.replaceState) history.replaceState(null, "", "#top");
      var h1 = doc.getElementById("hero-title"); if (h1) setTimeout(function () { h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); }, smooth ? 600 : 0);
    });
    function onScroll() {
      sraf = 0;
      var v = y(), s = v > 40 ? true : v < 12 ? false : scrolled;
      if (brand) { brand.classList.toggle("is-compact", s); brand.title = s ? "Back to the top" : ""; }
      if (s !== scrolled) { scrolled = s; clearTimeout(foldTimer); setState(s ? "closed" : "open", "scroll"); }
      else if (scrolled && state === "open" && openedAt >= 0 && Math.abs(v - openedAt) > 160) setState("closed", "scroll");
    }
    window.addEventListener("scroll", function () { if (!sraf) sraf = requestAnimationFrame(onScroll); }, { passive: true });
    settings.addEventListener("click", function () { clearTimeout(foldTimer); setState("open", "settings"); });
    themeBtn.addEventListener("click", function () {
      themeBtn.classList.remove("is-sliding"); void themeBtn.offsetWidth; themeBtn.classList.add("is-sliding");
      if (PF.theme) PF.theme.toggle(themeBtn);
      foldSoon(1250);                                // after the knob and most of the wave (1.15 s)
    });
    if (musicBtn) musicBtn.addEventListener("click", function () { foldSoon(900); });
    doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && scrolled && state === "open") setState("closed", "escape"); });
    doc.addEventListener("pointerdown", function (e) { if (scrolled && state === "open" && !hc.contains(e.target)) setState("closed", "outside"); }, true);
    // labels follow the theme / music state
    function syncTheme() {
      var t = PF.theme ? PF.theme.get() : "light", next = t === "dark" ? "light" : "dark";
      themeBtn.setAttribute("aria-label", "Theme: " + t + ". Switch to " + next);
      themeBtn.setAttribute("title", "Switch to " + next + " theme");
      var segs = themeBtn.querySelectorAll("[data-seg]");
      for (var i = 0; i < segs.length; i++) segs[i].classList.toggle("is-on", segs[i].getAttribute("data-seg") === t);
    }
    doc.addEventListener("pf:theme", syncTheme); syncTheme();
    function syncMusic() { hc.setAttribute("data-music-state", musicBtn && musicBtn.getAttribute("aria-pressed") === "true" ? "on" : "off"); }
    if (musicBtn && window.MutationObserver) new MutationObserver(syncMusic).observe(musicBtn, { attributes: true, attributeFilter: ["aria-pressed"] });
    syncMusic();
    onScroll();
    if (!scrolled) { hc.setAttribute("data-state", "open"); settings.setAttribute("aria-expanded", "true"); }
    hc.hidden = false;
    PF.controls = { state: function () { return state; }, open: function () { setState("open", "settings"); }, close: function () { setState("closed", "api"); } };
  });
})();
