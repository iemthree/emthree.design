/* main.js — navigation dock, case dialogs, motion preference, copy email, reveal.
   Classic script, one namespace (window.PF). Works over file://; no network, no storage required. */
(function () {
  "use strict";
  var PF = (window.PF = window.PF || {});
  var doc = document, root = doc.documentElement;

  /* ---------- motion preference: the OS «reduce motion» setting (owner 2026-10-19: the Motion toggle became the music button,
     so a choice stored by the old toggle is ignored — nothing on the page could change it back) ---------- */
  var mq = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var motion = !(mq && mq.matches);
  try { window.localStorage.removeItem("pf-motion"); } catch (e) {}
  PF.motion = {
    enabled: function () { return motion; },
    set: function (on) {
      motion = !!on;
      root.classList.toggle("motion-ok", motion);
      root.classList.toggle("reduce-motion", !motion);
      doc.dispatchEvent(new CustomEvent("pf:motion", { detail: { enabled: motion } }));
    }
  };
  PF.motion.set(motion);
  if (mq && mq.addEventListener) mq.addEventListener("change", function (e) { if (!PF.perfOff) PF.motion.set(!e.matches); });

  function ready(fn) { if (doc.readyState !== "loading") fn(); else doc.addEventListener("DOMContentLoaded", fn); }

  ready(function () {
    initDock();
    initCases();
    initCopy();
    initReveal();
    initRecent();
  });

  /* ---------- dock: current section + sliding indicator ---------- */
  function initDock() {
    var dock = doc.querySelector(".dock");
    if (!dock) return;
    var links = [].slice.call(dock.querySelectorAll(".dock-link"));
    var indicator = dock.querySelector(".dock-indicator");
    var ids = links.map(function (a) { return a.getAttribute("data-section"); });
    var sections = ids.map(function (id) { return doc.getElementById(id); });
    var current = null;

    function place() {
      var a = current && links[ids.indexOf(current)];
      if (!indicator) return;
      if (!a || a.classList.contains("dock-cta")) { indicator.classList.remove("is-on"); return; }
      var dl = dock.getBoundingClientRect(), r = a.getBoundingClientRect();
      indicator.style.width = r.width + "px";
      indicator.style.transform = "translateX(" + (r.left - dl.left) + "px)";
      indicator.style.top = (r.top - dl.top) + "px";
      indicator.style.height = r.height + "px";
      indicator.classList.add("is-on");
    }
    function setCurrent(id) {
      if (id === current) return;
      current = id;
      links.forEach(function (a) {
        if (a.getAttribute("data-section") === id) a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
      place();
    }
    PF.dock = { setCurrent: setCurrent, place: place, current: function () { return current; } };

    /* Which section owns the reading line (40% from the top)? Hero = home zone = none. */
    function compute() {
      var line = window.innerHeight * 0.4, found = null;
      for (var i = 0; i < sections.length; i++) {
        var s = sections[i]; if (!s) continue;
        var r = s.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) { found = ids[i]; break; }
      }
      // at the very bottom the last section is current even if short
      if (!found && window.innerHeight + window.scrollY >= doc.documentElement.scrollHeight - 2) found = ids[ids.length - 1];
      var contact = doc.getElementById("contact");
      if (contact && contact.getBoundingClientRect().top < window.innerHeight * 0.6 && window.innerHeight + window.scrollY >= doc.documentElement.scrollHeight - 2) found = "contact";
      setCurrent(found);
    }
    var ticking = false;
    function onScroll() { if (!ticking) { ticking = true; window.requestAnimationFrame(function () { ticking = false; compute(); }); } }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () { compute(); place(); });
    window.addEventListener("hashchange", function () { compute(); });
    window.addEventListener("popstate", function () { compute(); });
    if (window.ResizeObserver) new ResizeObserver(function () { place(); }).observe(dock);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(place);
    compute();
    // indicator starts without a transition so it does not fly in on load
    if (indicator) { indicator.style.transition = "none"; place(); indicator.getBoundingClientRect(); indicator.style.transition = ""; }
  }

  /* ---------- case studies in a dialog (inline fallback without dialog support) ---------- */
  function initCases() {
    var dlg = doc.querySelector("[data-case-dialog]");
    var supports = !!(dlg && typeof dlg.showModal === "function");
    if (!supports) { root.classList.add("no-dialog"); return; }
    root.classList.add("has-dialog");
    var slot = dlg.querySelector("[data-case-slot]");
    var label = dlg.querySelector("#case-dialog-title");
    var opener = null, moved = null, home = null;

    function open(id, from) {
      var node = doc.getElementById("case-" + id);
      if (!node) return false;
      opener = from || null;
      home = node.parentNode; moved = node;
      var marker = doc.createComment("case-" + id);
      home.insertBefore(marker, node); node._pfMarker = marker;
      slot.appendChild(node);
      var t = node.querySelector(".case-title");
      label.textContent = t ? t.textContent + " — case study" : "Case study";
      dlg.showModal();
      root.classList.add("dialog-open");
      var close = dlg.querySelector("[data-close-case]"); if (close) close.focus({ preventScroll: true });
      // a #case- fragment makes the browser scroll the moved article under the sticky bar — start at the top instead
      dlg.scrollTop = 0;
      window.requestAnimationFrame(function () { dlg.scrollTop = 0; });
      window.setTimeout(function () { dlg.scrollTop = 0; }, 60);
      return true;
    }
    function restore() {
      if (moved && moved._pfMarker) { moved._pfMarker.parentNode.insertBefore(moved, moved._pfMarker); moved._pfMarker.remove(); }
      moved = null;
      root.classList.remove("dialog-open");
      if (opener && opener.focus) opener.focus({ preventScroll: true });
      opener = null;
    }
    dlg.addEventListener("close", restore);
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); }); // click on the backdrop
    dlg.querySelector("[data-close-case]").addEventListener("click", function () { dlg.close(); });
    doc.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("[data-open-case]") : null;
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (open(a.getAttribute("data-open-case"), a)) e.preventDefault();
    });
    // a link to a case (#case-modern-ops) opens it — on load and on in-page hash changes
    function fromHash() {
      var m = /^#case-([\w-]+)$/.exec(window.location.hash);
      if (m && !dlg.open) { var a = doc.querySelector('[data-open-case="' + m[1] + '"]'); open(m[1], a); }
    }
    window.addEventListener("hashchange", fromHash);
    fromHash();
  }

  /* ---------- copy email (Clipboard API when allowed, manual selection otherwise) ---------- */
  function initCopy() {
    var btn = doc.querySelector("[data-copy-email]"), link = doc.querySelector("[data-email]"), status = doc.querySelector("[data-copy-status]");
    if (!btn || !link) return;
    btn.hidden = false;
    function selectText() {
      try { var r = doc.createRange(); r.selectNodeContents(link); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); } catch (e) {}
    }
    btn.addEventListener("click", function () {
      var text = link.textContent.trim();
      function fail() { selectText(); status.textContent = "Copy is blocked here — the address is selected, press ⌘C or Ctrl+C."; }
      if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext !== false) {
        navigator.clipboard.writeText(text).then(function () { status.textContent = "Email copied to the clipboard."; }, fail);
      } else { fail(); }
    });
  }

  /* ---------- reveal on scroll (only with motion; content stays visible without JS) ----------
     v2 (owner 2026-10-20: «более плавными и глубокими»): smaller units rise one by one — heads line by line, cards and
     list rows staggered by their place in the row — with blur and depth; images inside settle from a slight zoom.
     Styles in css/motion.css. */
  function initReveal() {
    if (!("IntersectionObserver" in window)) return;
    var SEL = [".section-head > *", ".proof-item", ".work-card", ".recent-head > *", ".recent-item", ".pipeline-info > *", ".step",
      ".about-id", ".about-main > p", ".sub-title", ".principle", ".note-card", ".exp-row", ".skills-grid > *", ".chips li",
      ".contact > *:not(.contact-links)", ".contact-links li", ".footer > *"].join(", ");
    var els = [].slice.call(doc.querySelectorAll(SEL)).filter(function (el) { return !el.closest(".cases, dialog, .hero"); });
    var vh = window.innerHeight;
    els.forEach(function (el) {
      if (el.getBoundingClientRect().top <= vh * 0.92) return;          // already on screen: leave it alone
      el.classList.add("reveal");
      if (el.matches(".section-title, .contact-lead, .block-title, .recent-h, .sub-title")) el.classList.add("reveal-line");
      var sib = el.parentElement ? [].filter.call(el.parentElement.children, function (c) { return c.classList.contains("reveal") || els.indexOf(c) >= 0; }) : [];
      var i = Math.max(0, sib.indexOf(el));
      el.style.setProperty("--rd", Math.min(i, 7) * 70 + "ms");
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    els.forEach(function (el) { if (el.classList.contains("reveal")) io.observe(el); });
  }
  /* ---------- recent work on phones: dots that follow the swipe row (decorative; the links stay the real controls) ---------- */
  function initRecent() {
    var list = doc.querySelector("[data-recent-list]"), dots = doc.querySelector("[data-recent-dots]");
    if (!list || !dots) return;
    var items = [].slice.call(list.children), btns = [], cur = -1, raf = 0;
    items.forEach(function (it, i) {
      var b = doc.createElement("button"); b.type = "button"; b.className = "recent-dot"; b.tabIndex = -1;
      b.addEventListener("click", function () {
        var pad = parseFloat(getComputedStyle(list).scrollPaddingLeft) || 0;
        list.scrollTo({ left: it.offsetLeft - list.offsetLeft - pad, behavior: PF.motion && PF.motion.enabled() ? "smooth" : "auto" });
      });
      dots.appendChild(b); btns.push(b);
    });
    function compute() {
      raf = 0;
      var max = list.scrollWidth - list.clientWidth, i = 0;
      if (max > 1) {
        if (list.scrollLeft >= max - 2) i = items.length - 1;
        else { var x = list.scrollLeft, best = 1e9; items.forEach(function (it, k) { var d = Math.abs(it.offsetLeft - list.offsetLeft - (parseFloat(getComputedStyle(list).scrollPaddingLeft) || 0) - x); if (d < best) { best = d; i = k; } }); }
      }
      if (i !== cur) { if (btns[cur]) btns[cur].classList.remove("is-on"); btns[i].classList.add("is-on"); cur = i; }
    }
    list.addEventListener("scroll", function () { if (!raf) raf = window.requestAnimationFrame(compute); }, { passive: true });
    window.addEventListener("resize", function () { if (!raf) raf = window.requestAnimationFrame(compute); });
    dots.hidden = false; compute();
  }
})();
