/* =========================================================
   Karla & Dino — 18. 06. 2027.
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------
     1. OVITAK — otvaranje pozivnice
     --------------------------------------------------------- */
  var stage    = $('#stage');
  var envelope = $('#envelope');
  var openBtn  = $('#openBtn');
  var enterBtn = $('#enterBtn');
  var sweep    = $('#stageSweep');
  var site     = $('#site');
  var opened   = false;
  var entered  = false;

  // koliko traje sama animacija otvaranja i koliko otvorena kuverta ostaje na ekranu
  var OPEN_MS = 1900;   // pečat pukne, preklop se otvori, pozivnica izroni
  var HOLD_MS = 6000;   // pozivnica se čita u miru prije prijelaza na stranicu
  var holdTimer = null;

  function enterSite() {
    if (entered) return;
    entered = true;
    clearTimeout(holdTimer);
    if (enterBtn) { enterBtn.setAttribute('tabindex', '-1'); enterBtn.blur(); }

    sweep.classList.add('is-on');
    setTimeout(function () {
      stage.classList.add('is-gone');
      stage.classList.remove('is-revealed');
      document.body.classList.remove('is-locked');
      site.classList.add('is-live');
      window.scrollTo(0, 0);
    }, reduced ? 100 : 650);
  }

  function openEnvelope() {
    if (opened) return;
    opened = true;

    stage.classList.add('is-opening');
    envelope.classList.add('is-cracking');
    envelope.setAttribute('aria-expanded', 'true');

    setTimeout(function () { envelope.classList.add('is-open'); }, reduced ? 0 : 420);

    if (reduced) { enterSite(); return; }

    setTimeout(function () {
      stage.classList.add('is-revealed');
      if (enterBtn) {
        enterBtn.removeAttribute('aria-hidden');
        enterBtn.setAttribute('tabindex', '0');
      }
    }, OPEN_MS);

    holdTimer = setTimeout(enterSite, OPEN_MS + HOLD_MS);
  }

  if (envelope) {
    envelope.addEventListener('click', openEnvelope);
    envelope.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); }
    });
  }
  if (openBtn) openBtn.addEventListener('click', openEnvelope);
  if (enterBtn) enterBtn.addEventListener('click', enterSite);

  // tipka Esc ili Enter preskače čekanje kad je pozivnica već vani
  document.addEventListener('keydown', function (e) {
    if (!opened || entered || !stage.classList.contains('is-revealed')) return;
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enterSite(); }
  });

  /* ---------------------------------------------------------
     2. OTKRIVANJE PRI SKROLANJU
     --------------------------------------------------------- */
  var revealables = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var i = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        el.style.transitionDelay = Math.min(i, 6) * 0.08 + 's';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------------------------------------------------
     3. NAVIGACIJA — sjena pri skrolanju, aktivna stavka, mobilni izbornik
     --------------------------------------------------------- */
  var nav = $('#nav');
  var navAnchors = $$('.nav-links a[href^="#"]');
  var sections = navAnchors
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset;
    if (nav) nav.classList.toggle('is-stuck', y > 20);

    var mid = y + window.innerHeight * 0.35;
    var current = null;
    sections.forEach(function (sec) { if (sec.offsetTop <= mid) current = sec.id; });
    navAnchors.forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('href') === '#' + current);
    });
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  var navToggle = $('#navToggle');
  var navLinks = $('#navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navLinks.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------------------------------------------------------
     4. RSVP — gumb otvara obrazac, obrazac šalje e-mail
     --------------------------------------------------------- */
  var rsvpOpen = $('#rsvpOpen');
  var form = $('#rsvpForm');
  var done = $('#rsvpDone');
  var doneMsg = $('#rsvpDoneMsg');

  if (rsvpOpen && form) {
    rsvpOpen.addEventListener('click', function () {
      var isOpen = !form.hidden;
      form.hidden = isOpen;
      rsvpOpen.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      if (!isOpen) {
        done.hidden = true;
        var first = $('#ime');
        if (first) first.focus({ preventScroll: true });
        form.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      }
    });
  }

  function markError(el, on) {
    var box = el.closest('.field') || el.closest('.choice');
    if (box) box.classList.toggle('has-error', on);
  }

  if (form) {
    $$('#rsvpForm input, #rsvpForm textarea').forEach(function (el) {
      el.addEventListener('input', function () { markError(el, false); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ime = $('#ime'), email = $('#email');
      var dolazak = form.querySelector('input[name="dolazak"]:checked');
      var ok = true;

      if (!ime.value.trim()) { markError(ime, true); ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { markError(email, true); ok = false; }
      if (!dolazak) { markError(form.querySelector('input[name="dolazak"]'), true); ok = false; }
      if (!ok) {
        var firstErr = $('.has-error');
        if (firstErr) firstErr.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
        return;
      }

      var dolazi = dolazak.value === 'Dolazim';
      var body =
        'Ime i prezime: ' + ime.value.trim() + '\n' +
        'E-mail: ' + email.value.trim() + '\n' +
        'Dolazak: ' + dolazak.value + '\n' +
        'Broj osoba: ' + ($('#osobe').value || '1') + '\n' +
        'Meni: ' + $('#menu').value + '\n' +
        'Napomena: ' + ($('#poruka').value.trim() || '-') + '\n';

      var mailto = 'mailto:karla.dino.vjencanje@example.com' +
        '?subject=' + encodeURIComponent('RSVP — vjenčanje Karla & Dino (' + ime.value.trim() + ')') +
        '&body=' + encodeURIComponent(body);

      if (doneMsg) {
        doneMsg.textContent = dolazi
          ? 'Vaša potvrda je spremna. Vidimo se 18. lipnja!'
          : 'Hvala što ste nam javili. Nedostajat ćete nam — nazdravit ćemo i u vaše ime.';
      }
      form.hidden = true;
      done.hidden = false;
      if (rsvpOpen) rsvpOpen.setAttribute('aria-expanded', 'false');
      done.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
      if (dolazi) confetti();

      window.location.href = mailto;
    });
  }

  var again = $('#rsvpAgain');
  if (again) {
    again.addEventListener('click', function () {
      form.reset();
      done.hidden = true;
      form.hidden = false;
      if (rsvpOpen) rsvpOpen.setAttribute('aria-expanded', 'true');
      form.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
    });
  }

  /* ---------------------------------------------------------
     5. LATICE koje nježno padaju u pozadini
     --------------------------------------------------------- */
  var petalColors = ['#ffffff', '#fdfaf2', '#f1eedf', '#e7ecda', '#dfe6cc'];

  function spawnPetal(burst) {
    var p = document.createElement('div');
    p.className = 'petal';
    var size = 5 + Math.random() * 8;
    p.style.width = size + 'px';
    p.style.height = size * (burst ? 0.5 : 0.8) + 'px';
    p.style.background = petalColors[(Math.random() * petalColors.length) | 0];
    p.style.boxShadow = '0 1px 3px rgba(120,116,90,.18)';
    p.style.left = (6 + Math.random() * 88) + 'vw';
    p.style.opacity = burst ? 0.95 : 0.45 + Math.random() * 0.3;
    document.body.appendChild(p);

    var dur = burst ? 2600 + Math.random() * 1600 : 12000 + Math.random() * 9000;
    var drift = (Math.random() - 0.5) * Math.min(burst ? 380 : 220, window.innerWidth * 0.4);
    var spin = (Math.random() - 0.5) * 900;

    var anim = p.animate([
      { transform: 'translate3d(0,0,0) rotate(0deg)', opacity: 0 },
      { opacity: parseFloat(p.style.opacity), offset: 0.1 },
      { transform: 'translate3d(' + drift + 'px,' + (window.innerHeight + 80) + 'px,0) rotate(' + spin + 'deg)', opacity: 0 }
    ], { duration: dur, easing: 'cubic-bezier(.3,.1,.5,1)' });

    anim.onfinish = function () { p.remove(); };
  }

  function confetti() {
    if (reduced) return;
    for (var i = 0; i < 50; i++) setTimeout(function () { spawnPetal(true); }, i * 30);
  }

  if (!reduced && typeof document.body.animate === 'function') {
    setInterval(function () {
      if (document.hidden || !site.classList.contains('is-live')) return;
      spawnPetal(false);
    }, 1600);
  }

  /* ---------------------------------------------------------
     6. GLATKO SKROLANJE uz odmak za navigaciju
     --------------------------------------------------------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.getElementById(id.slice(1));
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.pageYOffset - 70;
      window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });
})();
