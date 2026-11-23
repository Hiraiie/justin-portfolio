/* Page behaviour. Content lives in content.js — you rarely need to touch this. */
const $ = s => document.querySelector(s);

/* scroll reveal (+ 'done' class so hover effects aren't delayed afterwards) */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  const el = e.target; el.classList.add('in'); io.unobserve(el);
  setTimeout(() => el.classList.add('done'), 900);
}), { threshold: .12 });
const watch = r => (r || document).querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el));

/* typewriter */
(() => {
  const el = $('#type'); let i = 0, j = 0, del = false;
  (function tick() {
    const w = TITLES[i]; j += del ? -1 : 1; el.textContent = w.slice(0, j);
    let t = del ? 35 : 75;
    if (!del && j === w.length) { del = true; t = 1400; }
    else if (del && j === 0) { del = false; i = (i + 1) % TITLES.length; t = 350; }
    setTimeout(tick, t);
  })();
})();

/* nav: highlight the current section */
(() => {
  const links = [...document.querySelectorAll('[data-nav]')];
  const pr = $('#projects'), ct = $('#contact');
  let raf;
  const upd = () => {
    const y = scrollY + innerHeight * .35;
    const k = (innerHeight + scrollY >= document.body.scrollHeight - 4) || y >= ct.offsetTop ? 'contact' : y >= pr.offsetTop ? 'projects' : 'home';
    links.forEach(a => a.classList.toggle('active', a.dataset.nav === k));
  };
  addEventListener('scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(upd); }, { passive: true });
  upd();
})();

/* projects: EDITS first, ENGINEERING second */
let tab = 'edit', open = false;
const grid = $('#grid'), ind = $('#ind'), more = $('#more'), tabs = [...document.querySelectorAll('.tabs button')];
const yt = s => { const m = String(s).match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/); return m ? m[1] : null; };
const kind = s => yt(s) ? 'yt' : /\.(mp4|webm|mov)(\?|$)/i.test(s) ? 'video' : 'img';
const mediaOf = p => [].concat(p.media || []).filter(Boolean);
function thumbStyle(p) {
  const m = mediaOf(p)[0], t = p.thumb || (m && (kind(m) === 'yt' ? `https://img.youtube.com/vi/${yt(m)}/hqdefault.jpg` : kind(m) === 'img' ? m : ''));
  return t ? `style="background-image:url('${t}')"` : '';
}
const thumbVideo = p => { const m = mediaOf(p)[0]; return !p.thumb && m && kind(m) === 'video' ? `<video src="${m}#t=0.5" muted preload="metadata" playsinline></video>` : ''; };
function render(anim) {
  const list = P[tab];
  grid.innerHTML = list.map((p, i) => `<article class="card reveal${i > 1 ? ' more' : ''}" style="--d:${i % 2 * 90}ms">
  <div class="thumb${mediaOf(p).length ? '' : ' none'}" data-i="${i}" ${thumbStyle(p)}>
   ${thumbVideo(p)}<span class="t">${tab === 'eng' ? 'ENGINEERING' : 'EDIT'}</span>${mediaOf(p).length && kind(mediaOf(p)[0]) !== 'img' ? '<span class="play" aria-hidden="true">▶</span>' : ''}</div>
  <div class="body"><h3>${p.t}</h3><p>${p.d}</p>
  <div class="tags">${p.tags.map(x => `<span>${x}</span>`).join('')}</div>
  <div class="links">${p.links.map(l => `<a href="${l[1]}" target="_blank" rel="noopener noreferrer">${l[0]}</a>`).join('')}</div></div></article>`).join('');
  grid.classList.toggle('open', open);
  more.hidden = list.length <= 2; more.textContent = open ? 'SEE LESS ↑' : 'SEE MORE ↓';
  if (anim) { grid.classList.remove('swap'); void grid.offsetWidth; grid.classList.add('swap'); }
  watch(grid);
}
function moveInd() { const b = tabs.find(x => x.dataset.k === tab); ind.style.width = b.offsetWidth + 'px'; ind.style.transform = `translateX(${b.offsetLeft}px)`; }
tabs.forEach(b => b.onclick = () => {
  if (tab === b.dataset.k) return;
  tab = b.dataset.k; open = false;
  tabs.forEach(x => x.setAttribute('aria-selected', x === b)); moveInd(); render(true);
});
more.onclick = () => {
  open = !open; grid.classList.toggle('open', open);
  more.textContent = open ? 'SEE LESS ↑' : 'SEE MORE ↓'; watch(grid);
};
addEventListener('resize', moveInd);
document.fonts && document.fonts.ready.then(moveInd);

/* lightbox: plays YouTube links, video files and images */
const lb = $('#lb'), lbs = $('#lbs'), lbc = $('#lbc'); let cur = null, items = [], n = 0;
function show() {
  const s = items[n], k = kind(s);
  lbs.classList.toggle('tall', k === 'yt' && /shorts\//.test(s));
  lbs.innerHTML = k === 'yt' ? `<iframe src="https://www.youtube-nocookie.com/embed/${yt(s)}?autoplay=1&rel=0" allowfullscreen allow="autoplay;encrypted-media;picture-in-picture"></iframe>`
    : k === 'video' ? `<video src="${s}" controls autoplay playsinline></video>`
    : `<img src="${s}" alt="${cur.t} preview">`;
  lbc.textContent = cur.t.toUpperCase() + (items.length > 1 ? `  ${n + 1}/${items.length}` : '');
}
const step = d => { n = (n + d + items.length) % items.length; show(); };
const close = () => { lb.hidden = true; lbs.innerHTML = ''; document.body.style.overflow = ''; };
grid.addEventListener('click', e => {
  const t = e.target.closest('.thumb'); if (!t) return;
  cur = P[tab][+t.dataset.i]; items = mediaOf(cur); if (!items.length) return;
  n = 0; lb.classList.toggle('single', items.length < 2); show(); lb.hidden = false; document.body.style.overflow = 'hidden'; $('#lx').focus();
});
$('#lx').onclick = close; $('#lp').onclick = () => step(-1); $('#ln').onclick = () => step(1);
lb.addEventListener('click', e => { if (e.target === lb) close(); });
addEventListener('keydown', e => {
  if (lb.hidden) return;
  if (e.key === 'Escape') close(); if (items.length > 1) { if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); }
});

/* contact: links open a new tab, handles copy to clipboard */
$('#cgrid').innerHTML = C.map(c => c[2]
  ? `<button class="cbtn" data-v="${c[1]}"><span>${c[0]}</span><span class="i">⧉</span></button>`
  : `<a class="cbtn" href="${c[1]}" target="_blank" rel="noopener noreferrer"><span>${c[0]}</span><span>↗</span></a>`).join('');
document.querySelectorAll('button.cbtn').forEach(b => b.onclick = async () => {
  const v = b.dataset.v, l = b.firstChild, ic = b.lastChild, old = l.textContent;
  try { await navigator.clipboard.writeText(v); }
  catch (_) { const a = document.createElement('textarea'); a.value = v; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove(); }
  b.classList.add('ok'); l.textContent = 'COPIED!'; ic.textContent = '✓';
  clearTimeout(b._t); b._t = setTimeout(() => { b.classList.remove('ok'); l.textContent = old; ic.textContent = '⧉'; }, 2000);
});

render(false); watch(); requestAnimationFrame(moveInd);
