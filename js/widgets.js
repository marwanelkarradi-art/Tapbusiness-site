// ══════ TAPBusiness.ma — widgets.js : QR Generator + Before/After ══════
(function(){
  'use strict';

  var SITE = 'https://marwanelkarradi-art.github.io/Tapbusiness-site/demo.html';

  function slugify(s){
    return (s || '').toLowerCase().trim()
      .replace(/[àáâä]/g,'a').replace(/[éèêë]/g,'e')
      .replace(/[îï]/g,'i').replace(/[ôö]/g,'o')
      .replace(/[ùûü]/g,'u').replace(/ç/g,'c')
      .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')
      || 'mon-restaurant';
  }

  /* ══════ 1. QR GENERATOR ══════ */
  var qrName = document.getElementById('qrName');
  var qrBtn = document.getElementById('qrBtn');
  var qrBox = document.getElementById('qrCanvas');
  var qrCardName = document.getElementById('qrCardName');
  var qrCardUrl = document.getElementById('qrCardUrl');
  var qrDl = document.getElementById('qrDl');
  var qrDark = '#0d9488', qrLight = '#ffffff', currentSlug = 'chez-yasmine';

  function genQR(){
    var name = (qrName.value || '').trim() || 'Chez Yasmine';
    currentSlug = slugify(name);
    var url = SITE + '?r=' + currentSlug;
    qrBox.innerHTML = '';
    if(typeof QRCode === 'undefined'){
      qrBox.innerHTML = '<p class="qr-err">⚠️ QR ma tgenerach — checki l\'connexion w 3awd.</p>';
      return;
    }
    new QRCode(qrBox, {
      text: url, width: 220, height: 220,
      colorDark: qrDark, colorLight: qrLight,
      correctLevel: QRCode.CorrectLevel.M
    });
    qrCardName.textContent = '🍽️ ' + name;
    qrCardUrl.textContent = url.replace('https://', '');
  }

  if(qrBtn && qrBox){
    document.querySelectorAll('.qr-styles button').forEach(function(b){
      b.addEventListener('click', function(){
        document.querySelectorAll('.qr-styles button').forEach(function(x){
          x.classList.remove('on');
        });
        b.classList.add('on');
        qrDark = b.getAttribute('data-dark');
        qrLight = b.getAttribute('data-light');
        genQR();
      });
    });
    qrBtn.addEventListener('click', genQR);
    qrName.addEventListener('keydown', function(e){
      if(e.key === 'Enter') genQR();
    });
    qrDl.addEventListener('click', function(){
      function done(cv){
        var a = document.createElement('a');
        a.download = 'qr-' + currentSlug + '.png';
        a.href = cv.toDataURL('image/png');
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      var canvas = qrBox.querySelector('canvas');
      if(canvas){ done(canvas); return; }
      var img = qrBox.querySelector('img');
      if(img){
        var cv = document.createElement('canvas');
        cv.width = img.naturalWidth || 220;
        cv.height = img.naturalHeight || 220;
        cv.getContext('2d').drawImage(img, 0, 0);
        done(cv);
      }
    });
    genQR(); // QR par défaut au chargement
  }

  /* ══════ 2. BEFORE / AFTER SLIDER ══════ */
  var slider = document.getElementById('baSlider');
  if(slider){
    var before = document.getElementById('baBefore');
    var handle = document.getElementById('baHandle');
    var dragging = false;

    function setPos(clientX){
      var r = slider.getBoundingClientRect();
      var p = ((clientX - r.left) / r.width) * 100;
      setPct(p);
    }
    function setPct(p){
      p = Math.max(5, Math.min(95, p));
      before.style.clipPath = 'inset(0 ' + (100 - p).toFixed(1) + '% 0 0)';
      handle.style.left = p + '%';
    }
    slider.addEventListener('pointerdown', function(e){
      dragging = true;
      try{ slider.setPointerCapture(e.pointerId); }catch(_){}
      setPos(e.clientX);
    });
    slider.addEventListener('pointermove', function(e){
      if(dragging) setPos(e.clientX);
    });
    slider.addEventListener('pointerup', function(){ dragging = false; });
    slider.addEventListener('pointercancel', function(){ dragging = false; });
    handle.addEventListener('keydown', function(e){
      var cur = parseFloat(handle.style.left) || 50;
      if(e.key === 'ArrowLeft'){ setPct(cur - 5); e.preventDefault(); }
      if(e.key === 'ArrowRight'){ setPct(cur + 5); e.preventDefault(); }
    });
    // petite démo auto au premier affichage (s'arrête au toucher)
    var seen = false;
    new IntersectionObserver(function(es, obs){
      if(seen) return;
      es.forEach(function(en){
        if(!en.isIntersecting) return;
        seen = true; obs.disconnect();
        var p = 50, dir = 1, t0 = Date.now();
        var iv = setInterval(function(){
          if(dragging || Date.now() - t0 > 2400){ clearInterval(iv); setPct(50); return; }
          p += dir * 2;
          if(p >= 64 || p <= 36) dir *= -1;
          setPct(p);
        }, 40);
      });
    }, { threshold: 0.4 }).observe(slider);
  }

  /* ══════ 3. data-wimg → data-URIs IMGS1/2/3 ══════ */
  function wimg(ref){
    var parts = (ref || '').split(':');
    if(parts.length !== 2) return '';
    var store = null;
    if(parts[0] === 'IMGS1' && typeof IMGS1 !== 'undefined') store = IMGS1;
    else if(parts[0] === 'IMGS2' && typeof IMGS2 !== 'undefined') store = IMGS2;
    else if(parts[0] === 'IMGS3' && typeof IMGS3 !== 'undefined') store = IMGS3;
    return (store && store[parts[1]]) || '';
  }
  document.querySelectorAll('img[data-wimg]').forEach(function(img){
    var src = wimg(img.getAttribute('data-wimg'));
    if(src) img.src = src;
  });

  /* ══════ 4. mini QR f mockup digital ══════ */
  var digiQr = document.getElementById('digiQr');
  if(digiQr){
    if(typeof QRCode !== 'undefined'){
      new QRCode(digiQr, {
        text: SITE, width: 56, height: 56,
        colorDark: '#0d9488', colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    } else {
      digiQr.style.display = 'none';
    }
  }
})();
