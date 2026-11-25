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
  const ab = $('#about'), pr = $('#projects'), ct = $('#contact'), dock = $('#dock');
  let raf;
  const upd = () => {
    const y = scrollY + innerHeight * .35;
    const k = (innerHeight + scrollY >= document.body.scrollHeight - 4) || y >= ct.offsetTop ? 'contact' : y >= pr.offsetTop ? 'projects' : y >= ab.offsetTop ? 'about' : 'home';
    dock.classList.toggle('mini', scrollY > 60);
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
const IC = {"GITHUB": "<path d=\"M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22\"/>", "LINKEDIN": "<path d=\"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z\"/><circle cx=\"4\" cy=\"4\" r=\"2\"/>", "YOUTUBE": "<path d=\"M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z\"/><path d=\"M9.75 15.02 15.5 11.75 9.75 8.48z\"/>", "TIKTOK": "<path d=\"M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.3 2.4 2 4.2 5 4.5\"/>", "FACEBOOK": "<path d=\"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z\"/>", "INSTAGRAM": "<rect x=\"2\" y=\"2\" width=\"20\" height=\"20\" rx=\"5\"/><path d=\"M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01\"/>", "GMAIL": "<path d=\"M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z\"/><path d=\"m22 6-10 7L2 6\"/>", "DISCORD": "<path d=\"M7 6c3-1 7-1 10 0 2 3 3 6 3 10-1.500 1.200-3 1.800-4.500 2l-1-1.800M7 6C5 9 4 12 4 16c1.500 1.200 3 1.800 4.500 2l1-1.800M9 13h.01M15 13h.01\"/>", "TELEGRAM": "<path d=\"M22 2 11 13M22 2l-7 20-4-9-9-4z\"/>"};
const ico = k => `<svg class="ci" viewBox="0 0 24 24" aria-hidden="true">${IC[k] || ''}</svg>`;
$('#cgrid').innerHTML = C.map(c => c[2]
  ? `<button class="cbtn" data-v="${c[1]}"><span class="lab">${ico(c[0])}<b>${c[0]}</b></span><span class="i">⧉</span></button>`
  : `<a class="cbtn" href="${c[1]}" target="_blank" rel="noopener noreferrer"><span class="lab">${ico(c[0])}<b>${c[0]}</b></span><span>↗</span></a>`).join('');
document.querySelectorAll('button.cbtn').forEach(b => b.onclick = async () => {
  const v = b.dataset.v, l = b.querySelector('b'), ic = b.lastChild, old = l.textContent;
  try { await navigator.clipboard.writeText(v); }
  catch (_) { const a = document.createElement('textarea'); a.value = v; document.body.appendChild(a); a.select(); document.execCommand('copy'); a.remove(); }
  b.classList.add('ok'); l.textContent = 'COPIED!'; ic.textContent = '✓';
  clearTimeout(b._t); b._t = setTimeout(() => { b.classList.remove('ok'); l.textContent = old; ic.textContent = '⧉'; }, 2000);
});

render(false); watch(); requestAnimationFrame(moveInd);

/* dock magnification: items near the cursor swell, like the macOS dock */
(() => {
  const dock = $('#dock'), items = [...dock.querySelectorAll('.dk')];
  if (!matchMedia('(hover:hover)').matches || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  dock.addEventListener('pointermove', e => items.forEach(el => {
    const r = el.getBoundingClientRect(), d = Math.abs(e.clientX - (r.left + r.width / 2));
    el.style.transform = `scale(${1 + .14 * Math.exp(-(d * d) / 6000)})`;
  }));
  dock.addEventListener('pointerleave', () => items.forEach(el => el.style.transform = ''));
})();

/* welcome intro: blurred site -> "Welcome" fades in and out -> blur dissolves */
(() => {
  const box = $('#intro'), w = box.firstElementChild;
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  document.body.classList.add('lock'); scrollTo(0, 0);
  setTimeout(() => w.classList.add('in'), 250);
  setTimeout(() => w.classList.add('fade'), 2000);
  setTimeout(() => box.classList.add('out'), 2600);
  setTimeout(() => { box.remove(); document.body.classList.remove('lock'); }, 3900);
})();
