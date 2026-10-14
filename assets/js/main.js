/* TEDxSandervalia — interactions (menu mobile, en-tête, apparitions, galerie) */
(function () {
  "use strict";

  /* ----- Adresse de contact (un seul endroit à modifier) ----- */
  var CONTACT_EMAIL = "tedxsandervalia@gmail.com";
  document.querySelectorAll("[data-email]").forEach(function (el) {
    var subject = el.getAttribute("data-email");
    el.href = "mailto:" + CONTACT_EMAIL + (subject ? "?subject=" + encodeURIComponent(subject) : "");
    if (!el.textContent.trim()) el.textContent = CONTACT_EMAIL;
  });

  /* ----- Année courante dans le pied de page ----- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ----- Menu mobile ----- */
  var toggle = document.querySelector(".nav-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    document.querySelectorAll(".nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ----- Ombre de l'en-tête au défilement ----- */
  var header = document.querySelector(".site-header");
  var onScroll = function () {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ----- Apparition progressive ----- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ----- Galerie plein écran ----- */
  var links = Array.prototype.slice.call(document.querySelectorAll("[data-lightbox]"));
  if (links.length) {
    var box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Photo agrandie");
    box.innerHTML =
      '<button class="lightbox__close" aria-label="Fermer">&times;</button>' +
      '<button class="lightbox__prev" aria-label="Photo précédente">&#8249;</button>' +
      '<img alt="">' +
      '<button class="lightbox__next" aria-label="Photo suivante">&#8250;</button>';
    document.body.appendChild(box);
    var img = box.querySelector("img");
    var current = 0;
    var lastFocus = null;

    var show = function (i) {
      current = (i + links.length) % links.length;
      img.src = links[current].getAttribute("href");
      var thumb = links[current].querySelector("img");
      img.alt = thumb ? thumb.alt : "";
    };
    var open = function (i) {
      lastFocus = document.activeElement;
      show(i);
      box.classList.add("is-open");
      box.querySelector(".lightbox__close").focus();
    };
    var close = function () {
      box.classList.remove("is-open");
      if (lastFocus) lastFocus.focus();
    };

    links.forEach(function (a, i) {
      a.addEventListener("click", function (ev) { ev.preventDefault(); open(i); });
    });
    box.querySelector(".lightbox__close").addEventListener("click", close);
    box.querySelector(".lightbox__prev").addEventListener("click", function () { show(current - 1); });
    box.querySelector(".lightbox__next").addEventListener("click", function () { show(current + 1); });
    box.addEventListener("click", function (ev) { if (ev.target === box) close(); });
    document.addEventListener("keydown", function (ev) {
      if (!box.classList.contains("is-open")) return;
      if (ev.key === "Escape") close();
      if (ev.key === "ArrowLeft") show(current - 1);
      if (ev.key === "ArrowRight") show(current + 1);
    });
  }

  /* ----- Vidéos : la miniature est remplacée par le lecteur YouTube au clic (rien n'est chargé depuis YouTube avant) ----- */
  document.querySelectorAll(".yt[data-id]").forEach(function (btn) {
    var id = btn.getAttribute("data-id");
    btn.insertAdjacentHTML("afterbegin",
      '<img src="https://i.ytimg.com/vi/' + id + '/hqdefault.jpg" alt="" loading="lazy">' +
      '<span class="yt__play" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>');
    btn.addEventListener("click", function () {
      var frame = document.createElement("iframe");
      frame.src = "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0";
      frame.title = btn.getAttribute("aria-label") || "Vidéo";
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      frame.allowFullscreen = true;
      var box = document.createElement("div");
      box.className = "yt is-playing";
      box.appendChild(frame);
      btn.replaceWith(box);
      frame.focus();
    }, { once: true });
  });

  /* ----- Formulaire de contact : ouvre la messagerie (site statique, sans serveur) ----- */
  var form = document.querySelector("#contact-form");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var d = new FormData(form);
      var subject = "[" + d.get("objet") + "] " + d.get("nom");
      var body = d.get("message") + "\n\n— " + d.get("nom") + "\n" + d.get("email") + (d.get("organisation") ? "\n" + d.get("organisation") : "");
      window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    });
  }
})();
