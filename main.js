/* NORI A3 · one scroll loop drives every scroll-linked piece; everything else is event-driven. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const still = matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- menu ---------- */
  const nav = $("#nav"), menuBtn = $(".nav__menu"), menu = $("#menu");
  const setMenu = (open) => { menuBtn.setAttribute("aria-expanded", String(open)); menu.hidden = !open; };
  menuBtn.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", (e) => e.target.closest("a") && setMenu(false));
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { setMenu(false); menuBtn.focus(); } });

  /* ---------- mission: words light up as you read ---------- */
  const statement = $("[data-words]");
  statement.innerHTML = statement.textContent.trim().split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(" ");
  const words = $$(".w", statement);
  let lit = -1;

  /* ---------- the scroll loop ---------- */
  const film = $("#film"), pin = $(".film__pin"), fv = $(".film__video"), screen = $("[data-grow]");
  let filmCur = 0, queued = false;
  const card = $(".film__card");
  // the film's left edge, sampled at four moments: [progress, top colour, colour at a quarter down]
  const EDGE = [[0, [86, 104, 57], [124, 134, 93]], [0.3, [96, 112, 66], [127, 138, 97]], [0.61, [112, 125, 81], [138, 146, 108]], [1, [122, 132, 91], [144, 152, 116]]];
  const edge = (p, k) => {
    let i = 0;
    while (i < EDGE.length - 2 && p > EDGE[i + 1][0]) i++;
    const [p0, a] = [EDGE[i][0], EDGE[i][k]], [p1, b] = [EDGE[i + 1][0], EDGE[i + 1][k]], t = clamp((p - p0) / (p1 - p0), 0, 1);
    return `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * t)).join(",")})`;
  };

  function frame() {
    queued = false;
    const vh = innerHeight, y = scrollY;
    nav.classList.toggle("is-scrolled", y > 4);
    const fr = film.getBoundingClientRect();
    nav.classList.toggle("is-deal", fr.bottom < vh * 0.5);

    if (still.matches) {
      if (lit !== words.length) { words.forEach((w) => w.classList.add("on")); lit = words.length; }
      card.style.setProperty("--f-top", edge(1, 1)); card.style.setProperty("--f-q", edge(1, 2));
      return;
    }
    let again = false;

    // hero film: from the first scroll until the card lets go, the robot pulls back from its head to its wheels.
    // Desktop pins the card (pin is shorter than the film); phones scrub it as it passes up the screen.
    const pinned = film.offsetHeight > pin.offsetHeight + 1;
    const start = fr.top + y, travel = pinned ? start - (parseFloat(getComputedStyle(pin).top) || 0) + film.offsetHeight - pin.offsetHeight : start + film.offsetHeight - vh * 0.45;
    const fp = clamp(y / Math.max(travel, 1), 0, 1);
    filmCur += (fp - filmCur) * 0.2;
    if (Math.abs(fp - filmCur) < 0.0005) filmCur = fp; else again = true;
    card.style.setProperty("--f-top", edge(filmCur, 1)); card.style.setProperty("--f-q", edge(filmCur, 2));
    if (fv.duration && fr.bottom > 0 && !fv.seeking) {
      const t = filmCur * (fv.duration - 0.05);
      if (Math.abs(fv.currentTime - t) > 0.016) fv.currentTime = t;
    }

    // mission: words light up as the line crosses the middle of the screen
    const sr = statement.getBoundingClientRect();
    const n = Math.round(clamp((vh * 0.85 - sr.top) / (vh * 0.4 + sr.height), 0, 1) * words.length);
    if (n !== lit) { words.forEach((w, i) => w.classList.toggle("on", i < n)); lit = n; }

    // skills: the screen settles to full size as it arrives
    const kr = screen.getBoundingClientRect();
    screen.style.setProperty("--grow", (0.94 + 0.06 * ease(clamp((vh - kr.top) / (vh * 0.7), 0, 1))).toFixed(4));

    if (again) request();
  }
  const request = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };
  addEventListener("scroll", request, { passive: true });
  addEventListener("resize", request);
  still.addEventListener("change", request);
  // under reduced motion the film shows its last frame: the whole robot
  fv.addEventListener("loadedmetadata", () => { if (still.matches) fv.currentTime = fv.duration - 0.05; request(); });
  // iOS only seeks a video that has played once
  const unlock = () => { fv.play().then(() => fv.pause()).catch(() => {}); removeEventListener("touchstart", unlock); };
  addEventListener("touchstart", unlock, { passive: true });
  request();

  /* ---------- entrances: siblings 60 ms apart ---------- */
  const groups = new Map();
  $$(".reveal").forEach((el) => {
    const k = el.parentElement, i = groups.get(k) || 0;
    groups.set(k, i + 1);
    el.style.setProperty("--d", Math.min(i * 60, 300) + "ms");
  });
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -6% 0px", threshold: 0.1 });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- looping clips play only while seen; a click pauses or resumes one ---------- */
  const held = new WeakSet();
  const vio = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting && !still.matches && !held.has(v)) v.play().catch(() => {});
    else if (!e.isIntersecting) v.pause();
  }), { threshold: 0.25 });
  $$("video[data-auto]").forEach((v) => {
    if (still.matches) v.preload = "metadata";
    v.style.cursor = "pointer";
    v.addEventListener("click", () => { if (v.paused) { held.delete(v); v.play().catch(() => {}); } else { held.add(v); v.pause(); } });
    vio.observe(v);
  });

  /* ---------- everyday tasks: the active item's timer fills as its video plays, then the next opens ---------- */
  const items = $$(".switch__item"), panel = $("#task-panel"), clips = $$("video", panel), pp = $(".pp", panel);
  let cur = 0, seen = false, stopped = still.matches, raf = 0;
  if (still.matches) clips.forEach((v) => (v.preload = "metadata"));
  const timer = () => items[cur].querySelector(".timer");
  function tick() {
    const v = clips[cur];
    timer().style.setProperty("--p", v.duration ? (v.currentTime / v.duration).toFixed(4) : 0);
    raf = v.paused ? 0 : requestAnimationFrame(tick);
  }
  const syncPP = () => {
    const paused = clips[cur].paused;
    pp.classList.toggle("is-paused", paused);
    pp.setAttribute("aria-label", paused ? "Play video" : "Pause video");
  };
  const play = () => { if (seen && !stopped) clips[cur].play().catch(() => {}); };
  function select(i, focus) {
    if (i === cur && !focus) return play();
    const old = clips[cur];
    old.pause(); old.currentTime = 0; timer().style.setProperty("--p", 0);
    items[cur].setAttribute("aria-selected", "false"); items[cur].tabIndex = -1; old.classList.remove("is-active");
    cur = i;
    items[i].setAttribute("aria-selected", "true"); items[i].tabIndex = 0; clips[i].classList.add("is-active");
    panel.setAttribute("aria-labelledby", items[i].id);
    if (focus) items[i].focus();
    play(); syncPP();
  }
  items.forEach((t, i) => {
    t.addEventListener("click", () => { stopped = false; select(i); });
    t.addEventListener("keydown", (e) => {
      const n = items.length, j = { ArrowDown: (i + 1) % n, ArrowRight: (i + 1) % n, ArrowUp: (i - 1 + n) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
      if (j === undefined) return;
      e.preventDefault();
      select(j, true);
    });
  });
  clips.forEach((v) => {
    v.addEventListener("play", () => { if (v === clips[cur]) { cancelAnimationFrame(raf); tick(); syncPP(); } });
    v.addEventListener("pause", () => v === clips[cur] && syncPP());
    v.addEventListener("ended", () => { if (v === clips[cur] && !stopped) select((cur + 1) % clips.length); });
  });
  pp.addEventListener("click", () => {
    if (clips[cur].paused) { stopped = false; seen = true; clips[cur].play().catch(() => {}); } else { stopped = true; clips[cur].pause(); }
  });
  new IntersectionObserver(([e]) => { seen = e.isIntersecting; if (seen) play(); else clips[cur].pause(); }, { threshold: 0.35 }).observe(panel);
  syncPP();

  /* ---------- the hairline figure's host: what the bench does, on this page ---------- */
  const PARTS = { head: ["cameras"], neck: ["cameras"], arms: ["arms", "cameras"] };
  window.hairline = (figure) => {
    const stage = $("#nori-figure"), out = $("#nori-read"), list = $(".spec-list");
    if (!stage || !window.HL) return;
    HL.inject(document);
    stage.setAttribute("data-hairline", figure.name);
    stage.setAttribute("role", "img");
    stage.setAttribute("aria-label", "Line drawing of NORI A3. " + figure.means);
    const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
    let text = null;
    const read = {
      get textContent() { return text; },
      set textContent(v) {
        text = v == null ? "" : String(v);
        out.textContent = text === "rest" ? "" : text;
        const on = PARTS[text] || [];
        list.classList.toggle("has-part", on.length > 0);
        $$(".spec", list).forEach((s) => s.classList.toggle("is-part", on.includes(s.dataset.spec)));
      },
    };
    figure.mount({ stage, svg, read }, figure.range[1]);
    if (text === null) read.textContent = "rest";
  };
})();
