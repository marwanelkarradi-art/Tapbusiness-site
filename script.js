// ══════ TAPBusiness.ma — script.js ══════

// 1. Navbar: fond au scroll
const nav = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// 2. Menu burger (mobile)
const burger = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');
burger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open')));

// 3. Apparition au scroll (reveal)
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// 4. FAQ accordéon
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-q').addEventListener('click', () => {
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

// 6. Compteur animé (hero stats)
const cio = new IntersectionObserver(es => {
  es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, to = +el.dataset.to, t0 = performance.now();
    (function tick(t) {
      const p = Math.min((t - t0) / 1200, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
    cio.unobserve(el);
  });
}, { threshold: .5 });
document.querySelectorAll('.count').forEach(el => cio.observe(el));

// 5. Démo menu interactive
const MENU = {
  tacos: [
    { name: '🌮 Tacos poulet XL', price: '45 DH', img: 'images/tacos-poulet-xl.jpg' },
    { name: '🌮 Tacos viande hachée', price: '40 DH', img: 'images/tacos-viande-hachee.jpg' },
    { name: '🌮 Tacos mixte XXL', price: '55 DH', img: 'images/tacos-mixte-xxl.jpg' },
  ],
  pizza: [
    { name: '🍕 Pizza 4 fromages', price: '60 DH', img: 'images/pizza-4-fromages.jpg' },
    { name: '🍕 Pizza pepperoni', price: '65 DH', img: 'images/pizza-pepperoni.jpg' },
    { name: '🍕 Pizza fruits de mer', price: '75 DH', img: 'images/pizza-fruits-de-mer.jpg' },
  ],
  drinks: [
    { name: '🥤 Jus d\'avocat', price: '20 DH', img: 'images/jus-avocat.jpg' },
    { name: '🥤 Panaché', price: '18 DH', img: 'images/panache.jpg' },
    { name: '🥤 Soda 33cl', price: '10 DH', img: 'images/soda.jpg' },
  ]
};

const demoItems = document.getElementById('demoItems');
function showCat(cat) {
  demoItems.innerHTML = MENU[cat].map(i =>
    `<div class="demo-item"><img src="${i.img}" alt="${i.name}" loading="lazy"><div class="demo-txt"><span>${i.name}</span></div><b>${i.price}</b></div>`
  ).join('');
  document.querySelectorAll('#demoCats button').forEach(b =>
    b.classList.toggle('on', b.dataset.cat === cat));
}
document.querySelectorAll('#demoCats button').forEach(b =>
  b.addEventListener('click', () => showCat(b.dataset.cat)));
showCat('tacos'); // catégorie par défaut

// ══════ 7. PARTICLES f hero (canvas) ══════
(function(){
  const cv = document.getElementById('particles');
  if(!cv) return;
  const ctx = cv.getContext('2d');
  let W, H, pts = [];
  function size(){ W = cv.width = cv.offsetWidth; H = cv.height = cv.offsetHeight; }
  size(); window.addEventListener('resize', size);
  for(let i=0;i<70;i++) pts.push({
    x:Math.random(), y:Math.random(),
    vx:(Math.random()-.5)*.0009, vy:(Math.random()-.5)*.0009,
    r:Math.random()*2+.6
  });
  (function draw(){
    ctx.clearRect(0,0,W,H);
    pts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>1)p.vx*=-1; if(p.y<0||p.y>1)p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x*W,p.y*H,p.r,0,7);
      ctx.fillStyle='rgba(20,224,200,.5)'; ctx.fill();
    });
    // khtout bin n9at l'9rab
    for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
      const a=pts[i],b=pts[j],dx=(a.x-b.x)*W,dy=(a.y-b.y)*H,d=Math.hypot(dx,dy);
      if(d<130){ ctx.beginPath(); ctx.moveTo(a.x*W,a.y*H); ctx.lineTo(b.x*W,b.y*H);
        ctx.strokeStyle=`rgba(20,224,200,${(1-d/130)*.14})`; ctx.stroke(); }
    }
    requestAnimationFrame(draw);
  })();
})();

// ══════ 8. TYPEWRITER ══════
(function(){
  const el = document.getElementById('typed');
  if(!el) return;
  const words = ['les restaurants 🍽️','les cafés ☕','les snacks 🥙','les pizzerias 🍕','les glaciers 🍨'];
  let w=0, c=0, del=false;
  (function tick(){
    const word = words[w];
    el.textContent = word.slice(0, c);
    let t = del ? 35 : 75;
    if(!del && c === word.length){ t = 1600; del = true; }
    else if(del && c === 0){ del = false; w = (w+1)%words.length; t = 400; }
    c += del ? -1 : 1;
    setTimeout(tick, t);
  })();
})();

// ══════ 9. SCROLL PROGRESS + CURSOR GLOW ══════
const prog = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const h = document.documentElement;
  prog.style.width = (h.scrollTop/(h.scrollHeight-h.clientHeight)*100) + '%';
}, {passive:true});

const glow = document.getElementById('cursorGlow');
let gx=innerWidth/2, gy=200, tx=gx, ty=gy;
window.addEventListener('mousemove', e => { tx=e.clientX; ty=e.clientY; });
(function follow(){
  gx += (tx-gx)*.08; gy += (ty-gy)*.08;
  if(glow) glow.style.transform = `translate(${gx-170}px,${gy-170}px)`;
  requestAnimationFrame(follow);
})();

// ══════ 10. 3D TILT 3la cartes + téléphone ══════
document.querySelectorAll('.card, .price-card, .avis, .phone').forEach(el=>{
  el.classList.add('tilt');
  el.addEventListener('mousemove', e=>{
    const r = el.getBoundingClientRect();
    const x = (e.clientX-r.left)/r.width - .5;
    const y = (e.clientY-r.top)/r.height - .5;
    el.style.transform = `perspective(900px) rotateY(${x*10}deg) rotateX(${-y*10}deg) translateY(-4px)`;
  });
  el.addEventListener('mouseleave', ()=>{ el.style.transform=''; });
});

// ══════ 11. BOUTONS MAGNÉTIQUES ══════
document.querySelectorAll('.btn').forEach(b=>{
  b.addEventListener('mousemove', e=>{
    const r = b.getBoundingClientRect();
    b.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.25}px)`;
  });
  b.addEventListener('mouseleave', ()=>{ b.style.transform=''; });
});
