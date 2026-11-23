/* Fluid smoke background (stable-fluids on a small grid, upscaled).
   Tweak the look in CFG below. */
(() => {
  const CFG = {
    sources: 8,        // ambient smoke emitters (more = more smoke)  [was 5]
    density: .075,     // smoke added per emitter                      [was .05]
    radius: 2.2,       // size of each smoke puff                      [was 1.8]
    alpha: 120,        // max smoke opacity, 0-255                     [was 84]
    drift: .00005,     // how fast emitters wander (lower = slower)    [was .0001]
    force: .0025,      // push from emitters (lower = slower)          [was .004]
    dt: .05,           // flow speed (lower = slower)                  [was .1]
    fade: .996,        // how long smoke lingers (closer to 1 = longer)
    mouse: 18          // how strongly the cursor pushes the smoke
  };
  const cv = document.getElementById('smoke'), cx = cv.getContext('2d');
  const touch = matchMedia('(pointer:coarse)').matches, calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const N = touch ? 26 : 56, S = N + 2, Z = S * S, I = (i, j) => i + S * j, mk = () => new Float32Array(Z);
  let u = mk(), v = mk(), u0 = mk(), v0 = mk(), d = mk(), d0 = mk();
  const off = document.createElement('canvas'); off.width = off.height = N;
  const oc = off.getContext('2d'), img = oc.createImageData(N, N);
  const fit = () => { cv.width = Math.ceil(innerWidth / 3); cv.height = Math.ceil(innerHeight / 3); cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'high'; };
  fit(); addEventListener('resize', fit);
  function bnd(b, x) { for (let i = 1; i <= N; i++) { x[I(0, i)] = b == 1 ? -x[I(1, i)] : x[I(1, i)]; x[I(N + 1, i)] = b == 1 ? -x[I(N, i)] : x[I(N, i)]; x[I(i, 0)] = b == 2 ? -x[I(i, 1)] : x[I(i, 1)]; x[I(i, N + 1)] = b == 2 ? -x[I(i, N)] : x[I(i, N)]; } }
  function lin(b, x, x0, a, c) { for (let k = 0; k < 6; k++) { for (let j = 1; j <= N; j++) for (let i = 1; i <= N; i++) x[I(i, j)] = (x0[I(i, j)] + a * (x[I(i - 1, j)] + x[I(i + 1, j)] + x[I(i, j - 1)] + x[I(i, j + 1)])) / c; bnd(b, x); } }
  function adv(b, q, q0, U, V, dt) {
    const t = dt * N;
    for (let j = 1; j <= N; j++) for (let i = 1; i <= N; i++) {
      let x = i - t * U[I(i, j)], y = j - t * V[I(i, j)]; x = Math.min(N + .5, Math.max(.5, x)); y = Math.min(N + .5, Math.max(.5, y));
      const i0 = x | 0, j0 = y | 0, s1 = x - i0, s0 = 1 - s1, t1 = y - j0, t0 = 1 - t1;
      q[I(i, j)] = s0 * (t0 * q0[I(i0, j0)] + t1 * q0[I(i0, j0 + 1)]) + s1 * (t0 * q0[I(i0 + 1, j0)] + t1 * q0[I(i0 + 1, j0 + 1)]);
    } bnd(b, q);
  }
  function proj() {
    for (let j = 1; j <= N; j++) for (let i = 1; i <= N; i++) { v0[I(i, j)] = -.5 * (u[I(i + 1, j)] - u[I(i - 1, j)] + v[I(i, j + 1)] - v[I(i, j - 1)]) / N; u0[I(i, j)] = 0; }
    bnd(0, v0); bnd(0, u0); lin(0, u0, v0, 1, 4);
    for (let j = 1; j <= N; j++) for (let i = 1; i <= N; i++) { u[I(i, j)] -= .5 * N * (u0[I(i + 1, j)] - u0[I(i - 1, j)]); v[I(i, j)] -= .5 * N * (u0[I(i, j + 1)] - u0[I(i, j - 1)]); }
    bnd(1, u); bnd(2, v);
  }
  function splat(x, y, fu, fv, dens, r) {
    const r2 = r * r, R = Math.ceil(r * 2.5);
    for (let j = Math.max(1, y - R | 0); j <= Math.min(N, y + R | 0); j++) for (let i = Math.max(1, x - R | 0); i <= Math.min(N, x + R | 0); i++) {
      const w = Math.exp(-((i - x) ** 2 + (j - y) ** 2) / r2), k = I(i, j);
      u[k] += fu * w; v[k] += fv * w; if (dens > 0) d[k] += dens * w; else d[k] *= 1 + dens * w;
    }
  }
  function step(t) {
    for (let k = 0; k < CFG.sources; k++) {
      const a = t * CFG.drift;
      splat((.5 + .4 * Math.sin(a * (k + 1.3) + k * 1.9)) * N, (.5 + .4 * Math.cos(a * (k + .9) + k * 2.7)) * N,
        CFG.force * Math.cos(a * 3 + k * 2), CFG.force * Math.sin(a * 2.6 + k * 1.4), CFG.density, CFG.radius);
    }
    u0.set(u); v0.set(v); adv(1, u, u0, u0, v0, CFG.dt); adv(2, v, v0, u0, v0, CFG.dt); proj();
    d0.set(d); adv(0, d, d0, u, v, CFG.dt);
    for (let k = 0; k < Z; k++) { u[k] *= .965; v[k] *= .965; d[k] = Math.min(1.4, d[k] * CFG.fade); }
  }
  function draw() {
    const D = img.data;
    for (let j = 1; j <= N; j++) for (let i = 1; i <= N; i++) {
      const p = ((j - 1) * N + (i - 1)) * 4, a = Math.min(1, d[I(i, j)]);
      D[p] = 71 + a * 40; D[p + 1] = 85 + a * 45; D[p + 2] = 105 + a * 45; D[p + 3] = a * CFG.alpha;
    }
    oc.putImageData(img, 0, 0); cx.clearRect(0, 0, cv.width, cv.height); cx.drawImage(off, 0, 0, cv.width, cv.height);
  }
  /* cursor displaces the smoke (no visible cursor effects) */
  if (!touch && !calm) {
    let lx = null, ly = null;
    addEventListener('pointermove', e => {
      if (e.pointerType === 'touch') return;
      const gx = e.clientX / innerWidth * N + .5, gy = e.clientY / innerHeight * N + .5;
      if (lx !== null) { const dx = (gx - lx) / N, dy = (gy - ly) / N; splat(gx, gy, dx * CFG.mouse, dy * CFG.mouse, -.07, 2.6); }
      lx = gx; ly = gy;
    }, { passive: true });
    document.addEventListener('pointerleave', () => { lx = ly = null; });
  }
  if (calm) { for (let k = 0; k < 160; k++) step(k * 40); draw(); return; }
  let f = 0; (function loop(t) { if (!touch || (f++ & 1)) { step(t); draw(); } requestAnimationFrame(loop); })(0);
})();
