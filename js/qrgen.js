/* TAPBusiness QR generator — wired 2026-10-05 */
(function () {
  var btn = document.getElementById('qrBtn');
  if (!btn || typeof QRCode === 'undefined') return;

  var nameInput = document.getElementById('qrName');
  var nameLabel = document.querySelector('label[for="qrName"]');
  var urlInput = document.getElementById('qrUrl');
  var urlLabel = document.getElementById('qrUrlLabel');
  var canvas = document.getElementById('qrCanvas');
  var cardName = document.getElementById('qrCardName');
  var cardUrl = document.getElementById('qrCardUrl');
  var dl = document.getElementById('qrDl');

  var dark = '#0d9488', light = '#ffffff', mode = 'name';

  function show(el, on) { if (el) el.style.display = on ? '' : 'none'; }

  document.querySelectorAll('[data-qrmode]').forEach(function (b) {
    b.addEventListener('click', function () {
      mode = b.getAttribute('data-qrmode');
      document.querySelectorAll('[data-qrmode]').forEach(function (x) {
        x.classList.toggle('on', x === b);
      });
      var isName = mode === 'name';
      show(nameInput, isName); show(nameLabel, isName);
      show(urlInput, !isName); show(urlLabel, !isName);
    });
  });

  document.querySelectorAll('.qr-styles button').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.qr-styles button').forEach(function (x) { x.classList.remove('on'); });
      b.classList.add('on');
      dark = b.getAttribute('data-dark') || dark;
      light = b.getAttribute('data-light') || light;
    });
  });

  function slug(s) {
    return s.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'mon-resto';
  }

  function generate() {
    var target, label, shortUrl;
    if (mode === 'url') {
      target = urlInput.value.trim();
      if (!target) { urlInput.focus(); return; }
      if (!/^https?:\/\//i.test(target)) target = 'https://' + target;
      label = '🔗 Lien personnalisé';
      shortUrl = target.replace(/^https?:\/\//, '');
    } else {
      var name = nameInput.value.trim() || 'Chez Yasmine';
      target = 'https://marwanelkarradi-art.github.io/Tapbusiness-site/demo.html?r=' + slug(name);
      label = '🍽️ ' + name;
      shortUrl = 'marwanelkarradi-art.github.io/Tapbusiness-site/demo.html?r=' + slug(name);
    }
    canvas.innerHTML = '';
    new QRCode(canvas, {
      text: target, width: 200, height: 200,
      colorDark: dark, colorLight: light,
      correctLevel: QRCode.CorrectLevel.M
    });
    cardName.textContent = label;
    cardUrl.textContent = shortUrl;
  }

  btn.addEventListener('click', generate);

  if (dl) dl.addEventListener('click', function () {
    var c = canvas.querySelector('canvas');
    var img = canvas.querySelector('img');
    var href = c ? c.toDataURL('image/png') : (img ? img.src : null);
    if (!href) return;
    var a = document.createElement('a');
    a.href = href;
    a.download = 'tapbusiness-qr.png';
    document.body.appendChild(a); a.click(); a.remove();
  });

  generate(); // QR par défaut au chargement
})();
