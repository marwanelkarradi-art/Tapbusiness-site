/* ══════════ TAPBusiness — main interactions ══════════ */
(function () {
  'use strict';

  var SITE = 'https://tapbusiness-ma.github.io/Tapbusiness-site/demo.html';
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. Navbar ---------- */
  var nav = document.getElementById('navbar');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- 2. Fullscreen mobile menu ---------- */
  var burger = document.getElementById('burger');
  var mm = document.getElementById('mobileMenu');
  var mmClose = document.getElementById('mmClose');
  function setMenu(open) {
    mm.classList.toggle('open', open);
    mm.setAttribute('aria-hidden', open ? 'false' : 'true');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  burger.addEventListener('click', function () { setMenu(true); });
  mmClose.addEventListener('click', function () { setMenu(false); });
  mm.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  /* ---------- 3. Reveal on scroll ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ---------- 4. FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var btn = item.querySelector('.faq-q');
    btn.addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(function (i) {
        i.classList.remove('open');
        i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!wasOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- 5. data-wimg → IMGS data-URIs ---------- */
  function wimg(ref) {
    var p = (ref || '').split(':');
    if (p.length !== 2) return '';
    var store = null;
    if (p[0] === 'IMGS1' && typeof IMGS1 !== 'undefined') store = IMGS1;
    else if (p[0] === 'IMGS2' && typeof IMGS2 !== 'undefined') store = IMGS2;
    else if (p[0] === 'IMGS3' && typeof IMGS3 !== 'undefined') store = IMGS3;
    return (store && store[p[1]]) || '';
  }
  document.querySelectorAll('img[data-wimg]').forEach(function (img) {
    var src = wimg(img.getAttribute('data-wimg'));
    if (src) { img.src = src; }
  });

  function slugify(s) {
    return (s || '').toLowerCase().trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'mon-restaurant';
  }

  function makeQR(el, text, size, dark, light) {
    if (!el || typeof QRCode === 'undefined') return false;
    el.innerHTML = '';
    new QRCode(el, {
      text: text, width: size, height: size,
      colorDark: dark || '#0d9488', colorLight: light || '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
    return true;
  }

  /* ---------- 6. Hero QR + cinematic stage cycle ---------- */
  makeQR(document.getElementById('heroQr'), SITE + '?r=chez-yasmine', 150, '#111111', '#ffffff');

  var stages = Array.prototype.slice.call(document.querySelectorAll('#heroPhone .hs-stage'));
  var hsCount = document.getElementById('hsCount');
  if (stages.length > 1 && !reducedMotion) {
    var cur = 0, timer = null, heroVisible = true, count = 0;
    function show(i) {
      stages.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
      if (i === 1) { // menu stage → animate cart count 0→2
        count = 0; hsCount.textContent = '0';
        var iv = setInterval(function () {
          count++;
          if (count > 2 || !stages[1].classList.contains('is-active')) { clearInterval(iv); return; }
          hsCount.textContent = String(count);
        }, 900);
      }
    }
    function cycle() {
      timer = setInterval(function () {
        if (!heroVisible || document.hidden) return;
        cur = (cur + 1) % stages.length;
        show(cur);
      }, 3400);
    }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { heroVisible = e.isIntersecting; });
    }, { threshold: 0.15 }).observe(document.getElementById('heroPhone'));
    cycle();
  }

  /* ---------- 7. Demo interactive ---------- */
  var MENU = {
    tacos: [
      { name: 'Tacos poulet XL', price: '45 DH', img: (typeof IMGS1 !== 'undefined' && IMGS1['tacos-poulet-xl']) || '' },
      { name: 'Tacos viande hachée', price: '40 DH', img: (typeof IMGS1 !== 'undefined' && IMGS1['tacos-viande-hachee']) || '' },
      { name: 'Tacos mixte XXL', price: '55 DH', img: (typeof IMGS1 !== 'undefined' && IMGS1['tacos-mixte-xxl']) || '' }
    ],
    pizza: [
      { name: 'Pizza 4 fromages', price: '60 DH', img: (typeof IMGS2 !== 'undefined' && IMGS2['pizza-4-fromages']) || '' },
      { name: 'Pizza pepperoni', price: '65 DH', img: (typeof IMGS2 !== 'undefined' && IMGS2['pizza-pepperoni']) || '' },
      { name: 'Pizza fruits de mer', price: '75 DH', img: (typeof IMGS2 !== 'undefined' && IMGS2['pizza-fruits-de-mer']) || '' }
    ],
    drinks: [
      { name: "Jus d'avocat", price: '20 DH', img: (typeof IMGS3 !== 'undefined' && IMGS3['jus-avocat']) || '' },
      { name: 'Panaché', price: '18 DH', img: (typeof IMGS3 !== 'undefined' && IMGS3['panache']) || '' },
      { name: 'Soda 33cl', price: '10 DH', img: (typeof IMGS3 !== 'undefined' && IMGS3['soda']) || '' }
    ]
  };
  var demoItems = document.getElementById('demoItems');
  function showCat(cat) {
    if (!demoItems || !MENU[cat]) return;
    demoItems.innerHTML = MENU[cat].map(function (i) {
      return '<div class="demo-item">' +
        (i.img ? '<img src="' + i.img + '" alt="' + i.name + '" loading="lazy">' : '') +
        '<div class="demo-txt">' + i.name + '</div><b>' + i.price + '</b></div>';
    }).join('');
    document.querySelectorAll('#demoCats button').forEach(function (b) {
      b.classList.toggle('on', b.getAttribute('data-cat') === cat);
    });
  }
  document.querySelectorAll('#demoCats button').forEach(function (b) {
    b.addEventListener('click', function () { showCat(b.getAttribute('data-cat')); });
  });
  showCat('tacos');

  /* ---------- 8. QR Generator (fixed) ---------- */
  var qrBtn = document.getElementById('qrBtn');
  if (qrBtn) {
    var qrName = document.getElementById('qrName');
    var qrNameLabel = document.getElementById('qrNameLabel');
    var qrUrl = document.getElementById('qrUrl');
    var qrUrlLabel = document.getElementById('qrUrlLabel');
    var qrCanvas = document.getElementById('qrCanvas');
    var qrCardName = document.getElementById('qrCardName');
    var qrCardUrl = document.getElementById('qrCardUrl');
    var qrDl = document.getElementById('qrDl');
    var mode = 'name', dark = '#0d9488', light = '#ffffff', currentSlug = 'chez-yasmine';

    document.querySelectorAll('[data-qrmode]').forEach(function (b) {
      b.addEventListener('click', function () {
        mode = b.getAttribute('data-qrmode');
        var isName = mode === 'name';
        document.querySelectorAll('[data-qrmode]').forEach(function (x) {
          x.classList.toggle('on', x === b);
          x.setAttribute('aria-selected', x === b ? 'true' : 'false');
        });
        qrName.hidden = !isName; qrNameLabel.hidden = !isName;
        qrUrl.hidden = isName; qrUrlLabel.hidden = isName;
      });
    });

    document.querySelectorAll('.qr-styles button').forEach(function (b) {
      b.addEventListener('click', function () {
        document.querySelectorAll('.qr-styles button').forEach(function (x) { x.classList.remove('on'); });
        b.classList.add('on');
        dark = b.getAttribute('data-dark') || dark;
        light = b.getAttribute('data-light') || light;
        generate();
      });
    });

    function generate() {
      var target, label, short;
      if (mode === 'url') {
        target = (qrUrl.value || '').trim();
        if (!target) { qrUrl.focus(); return; }
        if (!/^https?:\/\//i.test(target)) target = 'https://' + target;
        label = 'Lien personnalisé';
        short = target.replace(/^https?:\/\//, '');
        currentSlug = 'lien-personnalise';
      } else {
        var name = (qrName.value || '').trim() || 'Chez Yasmine';
        currentSlug = slugify(name);
        target = SITE + '?r=' + currentSlug;
        label = name;
        short = target.replace(/^https?:\/\//, '');
      }
      if (!makeQR(qrCanvas, target, 190, dark, light)) {
        qrCanvas.innerHTML = '<p class="qr-err">QR indisponible hors connexion.</p>';
      }
      qrCardName.textContent = label;
      qrCardUrl.textContent = short;
    }

    qrBtn.addEventListener('click', generate);
    qrName.addEventListener('keydown', function (e) { if (e.key === 'Enter') generate(); });
    qrUrl.addEventListener('keydown', function (e) { if (e.key === 'Enter') generate(); });

    qrDl.addEventListener('click', function () {
      var cv = qrCanvas.querySelector('canvas');
      var img = qrCanvas.querySelector('img');
      var href = null;
      if (cv) href = cv.toDataURL('image/png');
      else if (img && img.src) {
        var c2 = document.createElement('canvas');
        c2.width = img.naturalWidth || 190; c2.height = img.naturalHeight || 190;
        c2.getContext('2d').drawImage(img, 0, 0);
        href = c2.toDataURL('image/png');
      }
      if (!href) return;
      var a = document.createElement('a');
      a.href = href; a.download = 'tapbusiness-qr-' + currentSlug + '.png';
      document.body.appendChild(a); a.click(); a.remove();
    });

    generate();
  }

  /* ---------- 9. Mini QR in before/after ---------- */
  makeQR(document.getElementById('digiQr'), SITE + '?r=chez-yasmine', 56, '#0d9488', '#ffffff');

  /* ---------- 10. Before / After slider ---------- */
  var slider = document.getElementById('baSlider');
  if (slider) {
    var before = document.getElementById('baBefore');
    var handle = document.getElementById('baHandle');
    var dragging = false;
    function setPct(p) {
      p = Math.max(5, Math.min(95, p));
      before.style.clipPath = 'inset(0 ' + (100 - p).toFixed(1) + '% 0 0)';
      handle.style.left = p + '%';
      handle.setAttribute('aria-valuenow', Math.round(p));
    }
    function setPos(clientX) {
      var r = slider.getBoundingClientRect();
      setPct(((clientX - r.left) / r.width) * 100);
    }
    slider.addEventListener('pointerdown', function (e) {
      dragging = true;
      try { slider.setPointerCapture(e.pointerId); } catch (_) {}
      setPos(e.clientX);
    });
    slider.addEventListener('pointermove', function (e) { if (dragging) setPos(e.clientX); });
    slider.addEventListener('pointerup', function () { dragging = false; });
    slider.addEventListener('pointercancel', function () { dragging = false; });
    handle.addEventListener('keydown', function (e) {
      var curp = parseFloat(handle.style.left) || 50;
      if (e.key === 'ArrowLeft') { setPct(curp - 5); e.preventDefault(); }
      if (e.key === 'ArrowRight') { setPct(curp + 5); e.preventDefault(); }
    });
    setPct(50);
    if (!reducedMotion) {
      var seen = false;
      new IntersectionObserver(function (es, obs) {
        es.forEach(function (en) {
          if (!en.isIntersecting || seen) return;
          seen = true; obs.disconnect();
          var p = 50, dir = 1, t0 = Date.now();
          var iv = setInterval(function () {
            if (dragging || Date.now() - t0 > 2400) { clearInterval(iv); setPct(50); return; }
            p += dir * 2;
            if (p >= 64 || p <= 36) dir *= -1;
            setPct(p);
          }, 40);
        });
      }, { threshold: 0.4 }).observe(slider);
    }
  }

  /* ---------- 11. Particles (subtle, pauses offscreen) ---------- */
  (function () {
    var cv = document.getElementById('particles');
    if (!cv || reducedMotion) return;
    var ctx = cv.getContext('2d');
    var W, H, pts = [], visible = true, raf = null;
    function size() { W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; }
    size();
    window.addEventListener('resize', size);
    for (var i = 0; i < 46; i++) pts.push({
      x: Math.random(), y: Math.random(),
      vx: (Math.random() - .5) * .0007, vy: (Math.random() - .5) * .0007,
      r: Math.random() * 1.8 + .6
    });
    function draw() {
      raf = null;
      if (!visible || document.hidden) return;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(217,164,65,.4)';
      pts.forEach(function (p) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.r, 0, 7); ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        visible = e.isIntersecting;
        if (visible && !raf) draw();
      });
    }).observe(cv.closest('.hero'));
    draw();
  })();

})();
