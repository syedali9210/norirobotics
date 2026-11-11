/**
 * Nori: the A3 robot drawn as the modules it is built from. Base on wheels with
 * its stop button, a mast, a torso with its two-tone seam, two arms with
 * grippers, a neck, and a head with a screen face, two pill eyes and an ear
 * disc. The module under the pointer slides out of the stack; the gaps open
 * around it, staggered outwards. Arms slide out sideways. The slider is the gap.
 */
const {
  Cam, fit, proj, facing, rings, prism, ringAt, run, rrect, circ, poly, open, hull,
  tween, tset, tval, tdone, mk, solid, put, register, pointer, disposer,
} = HL;

const G0 = 3, STEP = 45, ARMS = 5, ARM_AT = 2, AX = 31, OUT0 = 2;
// the stack, bottom to top: name, half width (x), half depth (y), corner radius, crease inset, z0, z1
const STACK = [
  ["base", 26, 22, 9, 1.8, 0, 16],
  ["mast", 5, 5, 2.5, 1, 16, 88],
  ["torso", 22, 16, 12, 1.8, 88, 128],
  ["neck", 6, 6, 2.5, 1, 128, 138],
  ["head", 21, 16, 7, 1.8, 138, 166],
];
// one arm, bottom to top: half width, half depth, y centre, z0, z1 (two fingers, gripper, forearm, upper arm, shoulder)
const ARM = [[2.5, 1.5, -4, 56, 66], [2.5, 1.5, 4, 56, 66], [5, 6, 0, 66, 76], [6, 6, 0, 76, 100], [5, 5, 0, 100, 114], [7, 7, 0, 114, 128]];
const NAMES = ["base", "mast", "torso", "neck", "head", "arms"];

/** A rounded solid from footprint and heights: draw(Q) writes it through the shifted projection Q. */
function box(parent, front, x0, y0, x1, y1, r, b, z0, z1) {
  const [ring, inner] = rings(x0, y0, x1, y1, r, b), s = solid(parent);
  return { s, ring, draw: (Q) => put(s, prism(Q, front, ring, inner, z0, z1)) };
}
/** A flat outline on a vertical face: `face(q)` maps a ring sample to a world point. */
function mark(parent, cls, ring, face) {
  const el = mk("path", { class: cls }, parent);
  return { el, draw: (Q) => el.setAttribute("d", poly(ring.map((q) => Q(...face(q))))) };
}
const shift = (ring, cu, cv) => ring.map((q) => ({ ...q, u: q.u + cu, v: q.v + cv }));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let gap = value;

  const C = Cam(45, 0.5, 1.36);
  const top = 166 + 4 * G0 + 2 * 22;
  fit(C, [[-AX - 7 - 18, -7, 56], [AX + 7 + 18, 7, 56], [-26, -22, -5], [26, 22, -5], [-21, -16, top], [21, 16, top]], 200, 166);
  const P = proj(C), front = facing(C);
  const at = (dx, dz) => (x, y, z) => P(x + dx, y, z + dz);

  const g = mk("g", {}, svg);
  const layer = { farArm: mk("g", {}, g) };
  STACK.forEach(([n]) => (layer[n] = mk("g", {}, g)));
  layer.nearArm = mk("g", {}, g);

  // each module: its solids and marks, and whether its silhouette is the highlight
  const mods = STACK.map(([n, hx, hy, r, b, z0, z1]) => {
    const parts = [box(layer[n], front, -hx, -hy, hx, hy, r, b, z0, z1)];
    return { n, parts, marks: [], sils: [parts[0].s.sil] };
  });
  // base: two front wheels and one on the side, below the body; the stop button on top
  const base = mods[0];
  for (const cx of [-17, 17]) base.marks.push(mark(layer.base, "", circ(6.5, 12), (q) => [cx + q.u, 22, 2 + q.v]));
  base.marks.push(mark(layer.base, "", circ(6.5, 12), (q) => [26, -13 + q.u, 2 + q.v]));
  for (const cx of [-17, 17]) base.marks.push(mark(layer.base, "nf lo", circ(2, 8), (q) => [cx + q.u, 22, 2 + q.v]));
  const btn = circ(3.2, 8).map((q) => ({ ...q, u: q.u - 15, v: q.v + 12 })), btnIn = circ(2.2, 8).map((q) => ({ ...q, u: q.u - 15, v: q.v + 12 }));
  const stop = solid(layer.base);
  base.parts.push({ s: stop, draw: (Q) => put(stop, prism(Q, front, btn, btnIn, 16, 19.5)) });
  base.sils.push(stop.sil);
  // torso: the seam where its white top meets its dark bottom
  const torso = mods[2], seam = mk("path", { class: "nf lo" }, layer.torso);
  torso.marks.push({ el: seam, draw: (Q) => seam.setAttribute("d", open(ringAt(Q, run(torso.parts[0].ring, front), 108))) });
  // head: the screen, two pill eyes, the ear disc and its hub
  const head = mods[4];
  head.marks.push(mark(layer.head, "nf", rrect(-13, 142, 13, 162, 4, 4), (q) => [q.u, 16, q.v]));
  const eyes = [-6, 6].map((cx) => mark(layer.head, "nf hi", rrect(cx - 2, 147, cx + 2, 157, 2, 3), (q) => [q.u, 16, q.v]));
  head.marks.push(...eyes);
  head.marks.push(mark(layer.head, "", circ(6.5, 12), (q) => [21, q.u, 152 + q.v]));
  head.marks.push(mark(layer.head, "nf lo", circ(3, 8), (q) => [21, q.u, 152 + q.v]));

  // arms: the far one behind the stack, the near one in front of it
  const arms = { n: "arms", parts: [], marks: [], sils: [] };
  for (const [side, lay] of [[-1, layer.farArm], [1, layer.nearArm]]) {
    for (const [hx, hy, cy, z0, z1] of ARM) {
      const cx = side * AX, p = box(lay, front, cx - hx, cy - hy, cx + hx, cy + hy, Math.min(hx, hy) * 0.6, Math.min(hx, hy) * 0.4, z0, z1);
      p.side = side;
      arms.parts.push(p);
      arms.sils.push(p.s.sil);
    }
  }
  mods.push(arms);

  // the clock: a lift per stack module, and the arms' reach out to the side
  const lift = STACK.map((_, i) => tween(i * G0)), out = tween(OUT0), last = new Array(6).fill(null);
  function draw(now) {
    let moving = false;
    mods.forEach((m, i) => {
      const dz = tval(lift[i === ARMS ? ARM_AT : i], now), dx = i === ARMS ? tval(out, now) : 0, key = dz + "," + dx;
      if (!tdone(lift[i === ARMS ? ARM_AT : i], now) || (i === ARMS && !tdone(out, now))) moving = true;
      if (last[i] === key) return;
      last[i] = key;
      m.parts.forEach((p) => p.draw(at((p.side || 0) * dx, dz)));
      m.marks.forEach((k) => k.draw(at(dx, dz)));
    });
    return moving;
  }
  const B = register(stage, (_dt, now) => draw(now));
  bag.add(B.unregister);

  // hit areas: each module's silhouette in its REST pose, reaching down over the gap under it; nothing draws them
  const restHull = (corners) => hull(corners.map(([x, y, z]) => P(x, y, z)));
  const areas = mods.map((m, i) => {
    const cube = (x0, x1, h, lo, hi) => {
      const c = [];
      for (const x of [x0, x1]) for (const y of [-h, h]) c.push([x, y, lo], [x, y, hi]);
      return restHull(c);
    };
    if (i === ARMS) return [-1, 1].map((s) => cube(s * (AX + OUT0) - 7, s * (AX + OUT0) + 7, 7, 56 + ARM_AT * G0, 128 + ARM_AT * G0));
    const [, hx, hy, , , z0, z1] = STACK[i], o = i * G0;
    return [cube(-hx, hx, hy, z0 + o - (i ? G0 : 6), z1 + o)];
  });
  const inside = (pts, [px, py]) => pts.every((a, k) => {
    const b = pts[(k + 1) % pts.length];
    return (b[0] - a[0]) * (py - a[1]) - (b[1] - a[1]) * (px - a[0]) >= 0;
  }) || pts.every((a, k) => {
    const b = pts[(k + 1) % pts.length];
    return (b[0] - a[0]) * (py - a[1]) - (b[1] - a[1]) * (px - a[0]) <= 0;
  });
  // nearest first: head, neck, near arm, torso, mast, base, far arm
  const ORDER = [4, 3, ARMS, 2, 1, 0];
  const hit = (p) => ORDER.find((i) => areas[i].some((h) => inside(h, p))) ?? -1;

  let act = -1;
  function targets(a, now, from) {
    STACK.forEach((_, i) => {
      let z = 0;
      for (let j = 1; j <= i; j++) z += a >= 0 && a !== ARMS && (a === j || a === j - 1) ? gap : G0;
      tset(lift[i], z, now, Math.abs(i - from) * STEP);
    });
    tset(out, a === ARMS ? gap * 0.8 : OUT0, now, 0);
  }
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    targets(a, now, from === ARMS ? ARM_AT : from);
    mods.forEach((m, i) => m.sils.forEach((s) => s.classList.toggle("hi", i === a)));
    eyes.forEach((e) => e.el.classList.toggle("hi", a < 0 || a === 4));
    read.textContent = a < 0 ? "rest" : NAMES[a];
    B.wake();
  }

  draw(performance.now());
  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), down: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { gap = v; if (act >= 0) { targets(act, performance.now(), act === ARMS ? ARM_AT : act); B.wake(); } },
    destroy: bag.dispose,
  };
}

hairline({
  name: "nori",
  means: "Nori A3 in its modules: the one under the pointer slides out of the stack, and the gaps open around it.",
  rules: [1, 2, 5, 9],
  range: [8, 14, 22],
  mount,
});
