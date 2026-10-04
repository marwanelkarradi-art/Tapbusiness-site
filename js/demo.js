// ══════ TAPBusiness.ma — demo.js : menu démo interactif ══════
(function(){
  'use strict';

  var WA_NUMBER = '212771899120';

  /* ---------- Nom du restaurant depuis ?r= ---------- */
  function getSlug(){
    try {
      var m = window.location.search.match(/[?&]r=([^&]+)/);
      return m ? decodeURIComponent(m[1].replace(/\+/g,' ')) : '';
    } catch(_){ return ''; }
  }
  function titleCase(slug){
    return slug.split('-').filter(Boolean).map(function(w){
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ') || 'Restaurant Démo';
  }
  var restoName = titleCase(getSlug());
  document.getElementById('dmName').textContent = '🍽️ ' + restoName;
  document.title = restoName + ' — Menu Digital (Démo)';

  /* ---------- Données démo (15 plats) ---------- */
  var IMG = {};
  try {
    if (typeof IMGS1 !== 'undefined') for (var k1 in IMGS1) IMG[k1] = IMGS1[k1];
    if (typeof IMGS2 !== 'undefined') for (var k2 in IMGS2) IMG[k2] = IMGS2[k2];
    if (typeof IMGS3 !== 'undefined') for (var k3 in IMGS3) IMG[k3] = IMGS3[k3];
  } catch(_){}

  var CATS = [
    { id:'tacos',    label:'🌮 Tacos' },
    { id:'pizzas',   label:'🍕 Pizzas' },
    { id:'boissons', label:'🥤 Boissons' },
    { id:'desserts', label:'🍰 Desserts' }
  ];
  var ITEMS = [
    { cat:'tacos',    name:'Tacos Poulet XL',      price:45, img:'tacos-poulet-xl' },
    { cat:'tacos',    name:'Tacos Viande Hachée',  price:40, img:'tacos-viande-hachee' },
    { cat:'tacos',    name:'Tacos Mixte XXL',      price:55, img:'tacos-mixte-xxl' },
    { cat:'tacos',    name:'Tacos Cordon Bleu',    price:48, img:'tacos-poulet-xl' },
    { cat:'pizzas',   name:'Pizza 4 Fromages',     price:60, img:'pizza-4-fromages' },
    { cat:'pizzas',   name:'Pizza Pepperoni',      price:65, img:'pizza-pepperoni' },
    { cat:'pizzas',   name:'Pizza Fruits de Mer',  price:75, img:'pizza-fruits-de-mer' },
    { cat:'pizzas',   name:'Pizza Végétarienne',   price:55, img:'pizza-pepperoni' },
    { cat:'boissons', name:"Jus d'Avocat",         price:20, img:'jus-avocat' },
    { cat:'boissons', name:'Panaché',              price:18, img:'panache' },
    { cat:'boissons', name:'Soda 33cl',            price:10, img:'soda' },
    { cat:'boissons', name:'Jus de Pomme',         price:15, img:'jus-avocat' },
    { cat:'desserts', name:'Coupe Glacée',         price:25, img:'panache' },
    { cat:'desserts', name:'Tiramisu Maison',      price:28, img:'panache' },
    { cat:'desserts', name:'Salade de Fruits',     price:22, img:'jus-avocat' }
  ];
  ITEMS.forEach(function(it, i){ it.id = i; });

  /* ---------- Mode : sur place / à emporter ---------- */
  var modeIn = document.getElementById('dmModeIn');
  var modeOut = document.getElementById('dmModeOut');
  var mode = 'in';
  function setMode(m){
    mode = m;
    modeIn.classList.toggle('on', m === 'in');
    modeOut.classList.toggle('on', m === 'out');
    renderOrderLink();
  }
  modeIn.addEventListener('click', function(){ setMode('in'); });
  modeOut.addEventListener('click', function(){ setMode('out'); });

  /* ---------- Rendu catégories + plats ---------- */
  var catsEl = document.getElementById('dmCats');
  var listEl = document.getElementById('dmList');
  var activeCat = CATS[0].id;

  CATS.forEach(function(c){
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'dm-pill' + (c.id === activeCat ? ' on' : '');
    b.textContent = c.label;
    b.setAttribute('data-cat', c.id);
    b.addEventListener('click', function(){
      activeCat = c.id;
      var pills = catsEl.querySelectorAll('.dm-pill');
      for (var i = 0; i < pills.length; i++)
        pills[i].classList.toggle('on', pills[i].getAttribute('data-cat') === activeCat);
      renderItems();
    });
    catsEl.appendChild(b);
  });

  function esc(s){
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')
                    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function renderItems(){
    var html = '';
    ITEMS.forEach(function(it){
      if (it.cat !== activeCat) return;
      var src = IMG[it.img] || '';
      html += '<article class="dm-card">'
        + '<img class="dm-photo" src="' + src + '" alt="' + esc(it.name) + '" loading="lazy">'
        + '<div class="dm-info"><h3>' + esc(it.name) + '</h3>'
        + '<span class="dm-price">' + it.price + ' DH</span></div>'
        + '<button class="dm-add" type="button" data-id="' + it.id + '" aria-label="Ajouter ' + esc(it.name) + '">+</button>'
        + '</article>';
    });
    listEl.innerHTML = html;
    var btns = listEl.querySelectorAll('.dm-add');
    for (var i = 0; i < btns.length; i++)
      btns[i].addEventListener('click', function(){ addToCart(+this.getAttribute('data-id')); });
  }

  /* ---------- Panier ---------- */
  var cart = {}; // id -> qty
  var cartBtn = document.getElementById('dmCartBtn');
  var countEl = document.getElementById('dmCount');
  var drawer = document.getElementById('dmDrawer');
  var overlay = document.getElementById('dmOverlay');
  var drawerItems = document.getElementById('dmDrawerItems');
  var totalEl = document.getElementById('dmTotal');
  var noteEl = document.getElementById('dmNote');
  var orderEl = document.getElementById('dmOrder');

  function cartCount(){
    var n = 0;
    for (var id in cart) n += cart[id];
    return n;
  }
  function cartTotal(){
    var t = 0;
    for (var id in cart) t += cart[id] * ITEMS[+id].price;
    return t;
  }

  function addToCart(id){
    cart[id] = (cart[id] || 0) + 1;
    updateCart();
    cartBtn.classList.remove('dm-pop');
    void cartBtn.offsetWidth;
    cartBtn.classList.add('dm-pop');
  }
  function changeQty(id, d){
    cart[id] = (cart[id] || 0) + d;
    if (cart[id] <= 0) delete cart[id];
    updateCart();
  }

  function updateCart(){
    countEl.textContent = cartCount();
    cartBtn.style.display = cartCount() ? 'flex' : 'none';
    var html = '', ids = Object.keys(cart);
    if (!ids.length)
      html = '<p class="dm-empty">Panier vide — zid chi plats 😋</p>';
    ids.forEach(function(id){
      var it = ITEMS[+id], q = cart[id], src = IMG[it.img] || '';
      html += '<div class="dm-line">'
        + '<img src="' + src + '" alt="">'
        + '<div><b>' + esc(it.name) + '</b><span>' + it.price + ' DH</span></div>'
        + '<div class="dm-qty">'
        + '<button type="button" data-a="-" data-id="' + id + '">−</button>'
        + '<b>' + q + '</b>'
        + '<button type="button" data-a="+" data-id="' + id + '">+</button>'
        + '</div></div>';
    });
    drawerItems.innerHTML = html;
    var btns = drawerItems.querySelectorAll('button[data-a]');
    for (var i = 0; i < btns.length; i++)
      btns[i].addEventListener('click', function(){
        changeQty(this.getAttribute('data-id'), this.getAttribute('data-a') === '+' ? 1 : -1);
      });
    totalEl.textContent = cartTotal() + ' DH';
    renderOrderLink();
  }

  function renderOrderLink(){
    var lines = ['🧪 Commande DÉMO — ' + restoName,
                 mode === 'in' ? '🪑 Sur place' : '📦 À emporter',
                 '———————————'];
    var ids = Object.keys(cart);
    ids.forEach(function(id){
      var it = ITEMS[+id], q = cart[id];
      lines.push(q + 'x ' + it.name + ' — ' + (q * it.price) + ' DH');
    });
    lines.push('———————————');
    lines.push('💰 Total: ' + cartTotal() + ' DH');
    var note = (noteEl.value || '').trim();
    if (note) lines.push('📝 Note: ' + note);
    orderEl.href = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(lines.join('\n'));
  }
  noteEl.addEventListener('input', renderOrderLink);

  function openDrawer(){
    drawer.classList.add('open');
    overlay.classList.add('show');
    drawer.setAttribute('aria-hidden', 'false');
  }
  function closeDrawer(){
    drawer.classList.remove('open');
    overlay.classList.remove('show');
    drawer.setAttribute('aria-hidden', 'true');
  }
  cartBtn.addEventListener('click', openDrawer);
  document.getElementById('dmClose').addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  renderItems();
  updateCart();
})();
