/* =========================================================
   Dino & Karla — 19.06.2027. — Bajkovita šuma
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------
     1. KRIJESNICE (canvas)
     --------------------------------------------------------- */
  function Fireflies(canvas, count, opts) {
    if (!canvas || reduced) return;
    opts = opts || {};
    var ctx = canvas.getContext('2d');
    var small = window.innerWidth < 760;
    var glow = small ? 4.5 : 7;
    count = Math.round(count * (small ? 0.45 : 1));
    var dots = [];
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, raf = null, visible = true;

    function size() {
      var r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      dots = [];
      for (var i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * (small ? 1.1 : 1.8) + 0.5,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          ph: Math.random() * Math.PI * 2,
          sp: Math.random() * 0.018 + 0.006
        });
      }
    }

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.x += d.vx; d.y += d.vy; d.ph += d.sp;
        if (d.x < -20) d.x = w + 20;
        if (d.x > w + 20) d.x = -20;
        if (d.y < -20) d.y = h + 20;
        if (d.y > h + 20) d.y = -20;

        var a = (Math.sin(d.ph) + 1) / 2;
        var alpha = 0.12 + a * (opts.alpha || 0.75);
        var g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * glow);
        g.addColorStop(0, 'rgba(255, 233, 160, ' + alpha + ')');
        g.addColorStop(0.35, 'rgba(226, 196, 110, ' + alpha * 0.36 + ')');
        g.addColorStop(1, 'rgba(226, 196, 110, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * glow, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 246, 214, ' + Math.min(1, alpha + 0.16) + ')';
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    size(); seed(); frame();
    window.addEventListener('resize', function () { size(); seed(); });

    // pauziraj kad sekcija nije u vidokrugu (štedi bateriju)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting && !raf && visible) frame();
          else if (!e.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
        });
      }, { threshold: 0 }).observe(canvas);
    }
    document.addEventListener('visibilitychange', function () {
      visible = !document.hidden;
      if (!visible && raf) { cancelAnimationFrame(raf); raf = null; }
      else if (visible && !raf) frame();
    });
  }

  /* ---------------------------------------------------------
     2. OVITAK — otvaranje pozivnice
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
      startHeroLetters();
      window.scrollTo(0, 0);
    }, reduced ? 100 : 650);
  }

  function openEnvelope() {
    if (opened) return;
    opened = true;

    stage.classList.add('is-opening');
    envelope.classList.add('is-cracking');
    envelope.setAttribute('aria-expanded', 'true');

    // 1) pečat puca  ->  2) preklop se otvara  ->  3) pozivnica izlazi
    setTimeout(function () { envelope.classList.add('is-open'); }, reduced ? 0 : 420);

    if (reduced) { enterSite(); return; }

    // 4) pozivnica ostaje otvorena, uz gumb za raniji ulazak
    setTimeout(function () {
      stage.classList.add('is-revealed');
      if (enterBtn) {
        enterBtn.removeAttribute('aria-hidden');
        enterBtn.setAttribute('tabindex', '0');
      }
    }, OPEN_MS);

    // 5) nakon zadržavanja, prijelaz u web-stranicu
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

  Fireflies($('#fireflies-intro'), 42, { alpha: 0.8 });

  /* ---------------------------------------------------------
     3. IMENA — animacija slovo po slovo
     --------------------------------------------------------- */
  $$('[data-split]').forEach(function (el) {
    var text = el.textContent.trim();
    el.textContent = '';
    text.split('').forEach(function (ch, i) {
      var span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch;
      span.style.animationDelay = (0.35 + i * 0.075) + 's';
      el.appendChild(span);
    });
  });
  function startHeroLetters() { /* animacija kreće preko .site.is-live */ }

  /* ---------------------------------------------------------
     4. ODBROJAVANJE do 19.06.2027. u 16:00 (CEST)
     --------------------------------------------------------- */
  var target = new Date('2027-06-19T16:00:00+02:00').getTime();
  var cd = {
    days:  $('#cdDays'),
    hours: $('#cdHours'),
    mins:  $('#cdMins'),
    secs:  $('#cdSecs')
  };
  var last = {};

  function pad(n, len) {
    n = String(Math.max(0, n));
    while (n.length < len) n = '0' + n;
    return n;
  }
  function setNum(el, val) {
    if (!el || last[el.id] === val) return;
    last[el.id] = val;
    el.textContent = val;
    if (reduced) return;
    el.classList.remove('tick');
    void el.offsetWidth;
    el.classList.add('tick');
  }
  function tickCountdown() {
    var diff = target - Date.now();
    if (diff <= 0) {
      setNum(cd.days, '000'); setNum(cd.hours, '00'); setNum(cd.mins, '00'); setNum(cd.secs, '00');
      var note = $('#cdNote');
      if (note) note.textContent = 'Danas je naš dan. Hvala što ste s nama!';
      return;
    }
    var s = Math.floor(diff / 1000);
    setNum(cd.days,  pad(Math.floor(s / 86400), 3));
    setNum(cd.hours, pad(Math.floor(s % 86400 / 3600), 2));
    setNum(cd.mins,  pad(Math.floor(s % 3600 / 60), 2));
    setNum(cd.secs,  pad(s % 60, 2));
  }
  if (cd.days) { tickCountdown(); setInterval(tickCountdown, 1000); }

  /* ---------------------------------------------------------
     5. OTKRIVANJE PRI SKROLANJU
     --------------------------------------------------------- */
  var revealables = $$('.reveal-up');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e, i) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var group = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
        el.style.transitionDelay = Math.min(group, 6) * 0.09 + 's';
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------------------------------------------------------
     6. PARALLAX ŠUME + NAPREDAK SKROLANJA + AKTIVNA NAVIGACIJA
     --------------------------------------------------------- */
  var layers = $$('.layer');
  var nav = $('#nav');
  var bar = $('#scrollProgress');
  var navAnchors = $$('.nav-links a[href^="#"]');
  var sections = navAnchors
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset;

    if (!reduced) {
      layers.forEach(function (l) {
        var d = parseFloat(l.dataset.depth) || 0.1;
        l.style.transform = 'translate3d(0,' + (y * d) + 'px,0)';
      });
    }
    if (nav) nav.classList.toggle('is-stuck', y > 40);
    if (bar) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }

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

  // blagi pomak hero-teksta i mišem
  if (!reduced && window.matchMedia('(pointer:fine)').matches) {
    var heroEl = $('.hero');
    if (heroEl) {
      heroEl.addEventListener('mousemove', function (e) {
        var cx = (e.clientX / window.innerWidth - 0.5);
        var cy = (e.clientY / window.innerHeight - 0.5);
        layers.forEach(function (l, i) {
          var f = (i + 1) * 5;
          l.style.marginLeft = (-cx * f) + 'px';
          l.style.marginTop = (-cy * f * 0.3) + 'px';
        });
      });
    }
  }

  /* ---------------------------------------------------------
     7. NAVIGACIJA (mobilni izbornik)
     --------------------------------------------------------- */
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
     8. LATICE koje nježno padaju u pozadini
     --------------------------------------------------------- */
  var petalColors = ['#f6efe2', '#e9d8c3', '#d9b8a8', '#c9a227', '#9db39b'];

  function spawnPetal() {
    var p = document.createElement('div');
    p.className = 'petal';
    var size = 6 + Math.random() * 9;
    p.style.width = size + 'px';
    p.style.height = size * 0.8 + 'px';
    p.style.background = petalColors[(Math.random() * petalColors.length) | 0];
    p.style.left = (6 + Math.random() * 88) + 'vw';
    p.style.opacity = 0.4 + Math.random() * 0.3;
    document.body.appendChild(p);

    var dur = 11000 + Math.random() * 9000;
    var drift = (Math.random() - 0.5) * Math.min(220, window.innerWidth * 0.3);
    var spin = (Math.random() - 0.5) * 900;

    var anim = p.animate([
      { transform: 'translate3d(0,0,0) rotate(0deg)', opacity: 0 },
      { opacity: parseFloat(p.style.opacity), offset: 0.1 },
      { transform: 'translate3d(' + drift + 'px,' + (window.innerHeight + 80) + 'px,0) rotate(' + spin + 'deg)', opacity: 0 }
    ], { duration: dur, easing: 'cubic-bezier(.3,.1,.5,1)' });

    anim.onfinish = function () { p.remove(); };
  }

  if (!reduced && typeof document.body.animate === 'function') {
    setInterval(function () {
      if (document.hidden || !site.classList.contains('is-live')) return;
      spawnPetal();
    }, 1400);
  }

  /* ---------------------------------------------------------
     9. KRIJESNICE NA HERO SEKCIJI
     --------------------------------------------------------- */
  Fireflies($('#fireflies-hero'), 55, { alpha: 0.7 });

  /* ---------------------------------------------------------
     10. DODAJ U KALENDAR (.ics)
     --------------------------------------------------------- */
  var icsBtn = document.getElementById('icsBtn');
  if (icsBtn) {
    icsBtn.addEventListener('click', function () {
      var ics = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Dino i Karla//Vjencanje//HR',
        'CALSCALE:GREGORIAN',
        'BEGIN:VEVENT',
        'UID:dino-karla-2027-06-19@vjencanje',
        'DTSTAMP:20270101T000000Z',
        'DTSTART:20270619T140000Z',
        'DTEND:20270620T020000Z',
        'SUMMARY:Vjencanje — Dino i Karla',
        'LOCATION:Bajkovita suma',
        'DESCRIPTION:Ceremonija u 16:00, slavlje od 17:00. Veselimo se!',
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\r\n');

      var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'Dino-i-Karla-19-06-2027.ics';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
  }

  /* ---------------------------------------------------------
     11. GLATKO SKROLANJE uz odmak za navigaciju
     --------------------------------------------------------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var t = document.getElementById(id.slice(1));
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.pageYOffset - 64;
      window.scrollTo({ top: top, behavior: reduced ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });
})();
