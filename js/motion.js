/* motion.js — site v2 pointer motion (owner 2026-10-20: premium hovers, modern buttons and tabs).
   - .tilt on image plates / previews: tilt towards the pointer (±5°), glare follows it (css/motion.css);
   - .btn / .dock-cta: magnetic pull (≤ 5 px) and a spotlight under the pointer;
   - dock: a hover pill that glides between tabs.
   Only with a fine pointer and motion allowed; everything is rAF-throttled and resets on leave. */
(function () {
  "use strict";
  var PF = (window.PF = window.PF || {});
  var doc = document;
  function ready(fn) { if (doc.readyState !== "loading") fn(); else doc.addEventListener("DOMContentLoaded", fn); }
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)");
  function on() { return fine && fine.matches && !(PF.motion && !PF.motion.enabled()); }
  function rafThrottle(fn) { var raf = 0, last; return function (e) { last = e; if (!raf) raf = requestAnimationFrame(function () { raf = 0; fn(last); }); }; }

  ready(function () {
    /* tilt + glare */
    [].forEach.call(doc.querySelectorAll(".work-plate, .recent-preview, .tile-art"), function (el) {
      el.classList.add("tilt");
      var host = el.closest(".work-card, .recent-item, .tile") || el;
      var move = rafThrottle(function (e) {
        if (!on()) return;
        var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        px = Math.min(1.1, Math.max(-0.1, px)); py = Math.min(1.1, Math.max(-0.1, py));
        var k = el.classList.contains("recent-preview") ? 7 : 4.5;
        el.style.setProperty("--ry", ((px - 0.5) * k).toFixed(2) + "deg");
        el.style.setProperty("--rx", ((0.5 - py) * k * 0.8).toFixed(2) + "deg");
        el.style.setProperty("--px", px.toFixed(3)); el.style.setProperty("--py", py.toFixed(3));
      });
      host.addEventListener("pointerenter", function () { if (on()) el.classList.add("is-hover"); });
      host.addEventListener("pointermove", move);
      host.addEventListener("pointerleave", function () { el.classList.remove("is-hover"); el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
    });

    /* magnetic buttons + spotlight */
    [].forEach.call(doc.querySelectorAll(".btn, .dock-cta"), function (b) {
      var move = rafThrottle(function (e) {
        var r = b.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        b.style.setProperty("--mx", x.toFixed(0) + "px"); b.style.setProperty("--my", y.toFixed(0) + "px");
        if (!on()) return;
        b.style.setProperty("--tx", (((x / r.width) - 0.5) * 8).toFixed(2) + "px");
        b.style.setProperty("--ty", (((y / r.height) - 0.5) * 5).toFixed(2) + "px");
      });
      b.addEventListener("pointermove", move);
      b.addEventListener("pointerleave", function () { b.style.setProperty("--tx", "0px"); b.style.setProperty("--ty", "0px"); });
    });

    /* dock hover pill */
    var dock = doc.querySelector(".dock");
    if (dock) {
      var pill = doc.createElement("span"); pill.className = "dock-hover"; pill.setAttribute("aria-hidden", "true");
      dock.insertBefore(pill, dock.firstChild);
      [].forEach.call(dock.querySelectorAll(".dock-link:not(.dock-cta)"), function (a) {
        a.addEventListener("pointerenter", function () {
          if (!on()) return;
          var dl = dock.getBoundingClientRect(), r = a.getBoundingClientRect();
          if (!pill.classList.contains("is-on")) { pill.style.transition = "none"; pill.style.transform = "translateX(" + (r.left - dl.left) + "px)"; pill.style.width = r.width + "px"; void pill.offsetWidth; pill.style.transition = ""; }
          pill.style.transform = "translateX(" + (r.left - dl.left) + "px)"; pill.style.width = r.width + "px";
          pill.style.top = (r.top - dl.top) + "px"; pill.style.height = r.height + "px";
          pill.classList.toggle("is-on", a.getAttribute("aria-current") !== "location");
        });
      });
      dock.addEventListener("pointerleave", function () { pill.classList.remove("is-on"); });
    }
  });
})();
