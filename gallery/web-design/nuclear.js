// A form that orbits: a dense nucleus, three ribbons that cross it, an electron on each. On hover: the orbits turn, each at its own pace, taking their electrons; the nucleus swells.
lumen({
  name: "nuclear",
  means: "An atom: a dense nucleus, three crossing orbit ribbons and an electron on each. On hover the orbits turn at their own paces and the nucleus swells.",
  draw(L) {
    const { disc, band, fade, glow, move } = L;
    const rx = 72, ry = 24;
    const tilts = [0, 60, 120], onOrbit = [20, 140, 260];
    const bands = tilts.map((t) => band(100, 100, rx, ry, 5, fade("soft", "deep", 100), t));
    const electrons = tilts.map((t, i) => {
      const a = (t * Math.PI) / 180, p = (onOrbit[i] * Math.PI) / 180;
      const x = rx * Math.cos(p), y = ry * Math.sin(p);
      return disc(100 + x * Math.cos(a) - y * Math.sin(a), 100 + x * Math.sin(a) + y * Math.cos(a), 7, glow("mist", "deep", 0.35, 0.3));
    });
    const nucleus = disc(100, 100, 15, glow("core", "mid"));
    const by = [60, -60, 90], dur = [1.1, 0.95, 0.8];
    move([...bands, ...electrons], "spin", { by: [...by, ...by], dur: [...dur, ...dur] });
    move(nucleus, "swell", { to: 1.16 });
  },
});
