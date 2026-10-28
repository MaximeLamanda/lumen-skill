// A form that changes: one core, and the two ribbons it sends round it. On hover: the sphere swells and the ribbons swing to cross the other way.
lumen({
  name: "evolve",
  means: "A sphere lit from its core, crossed by two ribbons. On hover the sphere swells and the ribbons swing to cross at the other angle.",
  rules: [2, 4, 5, 11],
  draw(L) {
    const { disc, band, glow, fade, move } = L;
    const sphere = disc(100, 100, 54, glow("core", "mid", "mist"));
    const a = band(100, 100, 74, 26, 6, fade("soft", "deep", 100), -38);
    const b = band(100, 100, 74, 26, 6, fade("soft", "deep", 80), 38);
    move(sphere, "swell", { to: 1.08 });
    move([a, b], "spin", { by: [90, -90], dur: 0.9, delay: 0.08 });
  },
});
