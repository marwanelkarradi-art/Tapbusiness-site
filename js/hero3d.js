/* ══════ TAPBusiness.ma — hero3d.js ══════
   Scène 3D Three.js pour le hero : smartphone 3D rotatif, formes
   flottantes or/teal, QR code flottant, champ de particules.
   - Se désactive proprement si le CDN Three.js échoue
   - Pause le rendu quand le hero n'est pas visible
   - Parallaxe souris + zoom subtil au scroll
*/
(function () {
  'use strict';
  if (typeof THREE === 'undefined') return; // CDN indisponible → site intact

  var canvas = document.getElementById('hero3d');
  var hero = canvas ? canvas.closest('.hero') : null;
  if (!canvas || !hero) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 768px)').matches;

  /* ---------- Renderer / scène / caméra ---------- */
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  } catch (e) { return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 8);

  /* ---------- Lumières (teal + gold = marque) ---------- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  var tealLight = new THREE.PointLight(0x14e0c8, 1.6, 30);
  tealLight.position.set(-4, 3, 4);
  scene.add(tealLight);
  var goldLight = new THREE.PointLight(0xe8c15a, 1.4, 30);
  goldLight.position.set(4, -2, 4);
  scene.add(goldLight);
  var rim = new THREE.DirectionalLight(0x8b5cf6, 0.5);
  rim.position.set(0, 4, -4);
  scene.add(rim);

  var rig = new THREE.Group(); // parallaxe souris globale
  scene.add(rig);

  /* ---------- Texture écran : mini menu dessiné en canvas ---------- */
  function drawScreen(ctx, W, H) {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#0d2b28'); g.addColorStop(1, '#081a18');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#f1f5f9';
    ctx.font = '700 40px Sora, Arial, sans-serif';
    ctx.fillText('🍽️ Chez Yasmine', W / 2, 70);
    // pastilles catégories
    var cats = ['Tacos', 'Pizza', 'Boissons'];
    ctx.font = '600 24px Inter, Arial, sans-serif';
    cats.forEach(function (c, i) {
      var x = W / 2 + (i - 1) * 150, y = 125;
      ctx.fillStyle = i === 0 ? '#e8c15a' : 'rgba(255,255,255,.08)';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x - 65, y - 30, 130, 46, 23); else ctx.rect(x - 65, y - 30, 130, 46);
      ctx.fill();
      ctx.fillStyle = i === 0 ? '#04110f' : '#f1f5f9';
      ctx.fillText(c, x, y + 2);
    });
    // plats
    var items = [
      ['Tacos XL', '45 DH'],
      ['Pizza 4 fromages', '60 DH'],
      ["Jus d'avocat", '20 DH']
    ];
    items.forEach(function (it, i) {
      var y = 220 + i * 110;
      ctx.fillStyle = 'rgba(255,255,255,.05)';
      if (ctx.roundRect) ctx.roundRect(30, y - 42, W - 60, 88, 18); else ctx.rect(30, y - 42, W - 60, 88, 18);
      ctx.fill();
      ctx.textAlign = 'left';
      ctx.fillStyle = '#f1f5f9'; ctx.font = '600 28px Inter, Arial, sans-serif';
      ctx.fillText(it[0], 52, y);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#e8c15a'; ctx.font = '700 30px Sora, Arial, sans-serif';
      ctx.fillText(it[1], W - 52, y);
    });
    // bouton WhatsApp
    ctx.fillStyle = '#22c55e';
    if (ctx.roundRect) ctx.roundRect(30, H - 120, W - 60, 76, 18); else ctx.rect(30, H - 120, W - 60, 76, 18);
    ctx.fill();
    ctx.fillStyle = '#04110f'; ctx.textAlign = 'center';
    ctx.font = '700 30px Inter, Arial, sans-serif';
    ctx.fillText('💬 Commander', W / 2, H - 72);
  }
  var scrCanvas = document.createElement('canvas');
  scrCanvas.width = 512; scrCanvas.height = 1024;
  drawScreen(scrCanvas.getContext('2d'), 512, 1024);
  var scrTex = new THREE.CanvasTexture(scrCanvas);
  scrTex.anisotropy = 4;
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      drawScreen(scrCanvas.getContext('2d'), 512, 1024);
      scrTex.needsUpdate = true;
    });
  }

  /* ---------- Smartphone 3D (ExtrudeGeometry = coque arrondie) ---------- */
  function roundedRect(w, h, r) {
    var s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  var phone = new THREE.Group();
  var PW = 1.5, PH = 3.0, DEPTH = 0.14;
  var bodyGeo = new THREE.ExtrudeGeometry(roundedRect(PW, PH, 0.22), {
    depth: DEPTH, bevelEnabled: true, bevelThickness: 0.025,
    bevelSize: 0.025, bevelSegments: 3, curveSegments: 16
  });
  bodyGeo.translate(0, 0, -DEPTH / 2);
  var bodyMat = new THREE.MeshStandardMaterial({
    color: 0x11141c, metalness: 0.85, roughness: 0.35
  });
  phone.add(new THREE.Mesh(bodyGeo, bodyMat));
  // écran
  var screen = new THREE.Mesh(
    new THREE.PlaneGeometry(PW * 0.88, PH * 0.92),
    new THREE.MeshBasicMaterial({ map: scrTex })
  );
  screen.position.z = DEPTH / 2 + 0.028;
  phone.add(screen);
  // liseré doré autour de l'écran (cadre fin)
  var frameGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(PW * 0.94, PH * 0.97),
    new THREE.MeshBasicMaterial({ color: 0xe8c15a, transparent: true, opacity: 0.25 })
  );
  frameGlow.position.z = DEPTH / 2 + 0.02;
  phone.add(frameGlow);
  phone.position.set(2.4, 0.1, 0);
  phone.rotation.y = -0.35;
  rig.add(phone);

  /* ---------- Formes flottantes ---------- */
  var floaters = [];
  function addFloater(mesh, x, y, z, sx, sy) {
    mesh.position.set(x, y, z);
    mesh.userData = { bx: x, by: y, sx: sx || 0.6, sy: sy || 0.8, ph: Math.random() * 6.28 };
    rig.add(mesh); floaters.push(mesh);
    return mesh;
  }
  var goldMat = new THREE.MeshStandardMaterial({ color: 0xe8c15a, metalness: 0.9, roughness: 0.25 });
  var tealMat = new THREE.MeshStandardMaterial({ color: 0x14e0c8, metalness: 0.6, roughness: 0.35 });
  var violetMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, metalness: 0.6, roughness: 0.35 });

  var torus = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.17, 18, 56), goldMat);
  addFloater(torus, -3.1, 1.7, -1.2);
  addFloater(new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 0), tealMat), -2.2, -1.5, -0.5, 0.9, 0.7);
  addFloater(new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), violetMat), 0.4, 2.1, -1.5, 0.7, 1.0);
  addFloater(new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), goldMat), -0.9, 0.4, -2, 1.1, 0.6);

  /* ---------- QR code flottant (procédural) ---------- */
  (function () {
    var S = 25, C = document.createElement('canvas');
    C.width = C.height = 256;
    var c = C.getContext('2d'), u = 256 / S;
    c.fillStyle = '#0b1120'; c.fillRect(0, 0, 256, 256);
    c.fillStyle = '#f1f5f9';
    function finder(fx, fy) {
      c.fillRect(fx * u, fy * u, 7 * u, 7 * u);
      c.fillStyle = '#0b1120'; c.fillRect((fx + 1) * u, (fy + 1) * u, 5 * u, 5 * u);
      c.fillStyle = '#f1f5f9'; c.fillRect((fx + 2) * u, (fy + 2) * u, 3 * u, 3 * u);
    }
    finder(0, 0); finder(S - 7, 0); finder(0, S - 7);
    var seed = 42;
    function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
    for (var y = 0; y < S; y++) for (var x = 0; x < S; x++) {
      var inF = (x < 8 && y < 8) || (x >= S - 8 && y < 8) || (x < 8 && y >= S - 8);
      if (!inF && rnd() > 0.52) c.fillRect(x * u, y * u, u, u);
    }
    var qr = new THREE.Mesh(
      new THREE.PlaneGeometry(0.95, 0.95),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(C), transparent: true })
    );
    qr.rotation.set(-0.15, 0.35, 0.08);
    addFloater(qr, 1.15, -1.55, 0.6, 0.8, 1.1);
  })();

  /* ---------- Champ de particules 3D ---------- */
  var pCount = isMobile ? 130 : 340;
  var pGeo = new THREE.BufferGeometry();
  var pos = new Float32Array(pCount * 3), col = new Float32Array(pCount * 3);
  var teal = new THREE.Color(0x14e0c8), gold = new THREE.Color(0xe8c15a);
  for (var i = 0; i < pCount; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 12;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 7;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
    var cc = Math.random() > 0.45 ? teal : gold;
    col[i * 3] = cc.r; col[i * 3 + 1] = cc.g; col[i * 3 + 2] = cc.b;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  var points = new THREE.Points(pGeo, new THREE.PointsMaterial({
    size: 0.045, vertexColors: true, transparent: true, opacity: 0.75,
    sizeAttenuation: true, depthWrite: false
  }));
  rig.add(points);

  /* ---------- Resize ---------- */
  function resize() {
    var w = hero.clientWidth || window.innerWidth;
    var h = hero.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    var aspect = w / h;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    // le téléphone reste visible à droite sur mobile
    if (aspect < 1) { phone.position.x = 1.35; phone.scale.setScalar(0.72); }
    else { phone.position.x = 2.4; phone.scale.setScalar(1); }
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---------- Souris + Touch (parallaxe) ---------- */
  var mx = 0, my = 0, smx = 0, smy = 0;
  window.addEventListener('mousemove', function (e) {
    mx = (e.clientX / window.innerWidth) * 2 - 1;
    my = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });
  /* Touch: swbe3 kay7errek l'machhad 3D f telephone */
  hero.addEventListener('touchmove', function (e) {
    var t = e.touches[0];
    if (!t) return;
    mx = (t.clientX / window.innerWidth) * 2 - 1;
    my = (t.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  /* ---------- Scroll (zoom subtil) ---------- */
  var scrollP = 0;
  function onScroll() {
    var r = hero.getBoundingClientRect();
    scrollP = Math.min(Math.max(-r.top / window.innerHeight, 0), 1);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Boucle ---------- */
  var visible = true, running = false, t = 0;
  var camZ = 8, rigRY = 0;

  function frame() {
    if (!visible) { running = false; return; }
    running = true;
    t += 0.008;

    smx += (mx - smx) * 0.05;
    smy += (my - smy) * 0.05;

    // parallaxe globale douce
    var tRY = smx * 0.08, tRX = smy * 0.05;
    rigRY += (tRY - rigRY) * 0.06;
    rig.rotation.y = rigRY;
    rig.rotation.x += (tRX - rig.rotation.x) * 0.06;
    rig.position.x = smx * 0.25;

    if (!reducedMotion) {
      // smartphone : rotation lente + flottement + tilt souris
      phone.rotation.y = -0.35 + Math.sin(t * 0.45) * 0.28 + smx * 0.45;
      phone.rotation.x = smy * 0.18 + Math.sin(t * 0.6) * 0.04;
      phone.position.y = 0.1 + Math.sin(t * 0.9) * 0.14;
      // formes flottantes
      floaters.forEach(function (f, i) {
        var u2 = f.userData;
        f.position.y = u2.by + Math.sin(t * u2.sy + u2.ph) * 0.22;
        f.position.x = u2.bx + Math.cos(t * u2.sx + u2.ph) * 0.12;
        f.rotation.x += 0.003 + i * 0.0004;
        f.rotation.y += 0.004;
      });
      points.rotation.y = t * 0.03;
    }

    // zoom caméra au scroll (lerp doux)
    var tZ = 8 + scrollP * 2.6;
    camZ += (tZ - camZ) * 0.06;
    camera.position.z = camZ;
    camera.position.y = -scrollP * 0.7;
    camera.lookAt(0, -scrollP * 0.4, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  // pause quand le hero sort de l'écran
  new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      visible = e.isIntersecting;
      if (visible && !running) frame();
    });
  }, { threshold: 0.02 }).observe(hero);

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && visible && !running) frame();
  });

  frame();
})();
