// A core sample: four discs stacked, the top one holding the core. On hover: the stack sinks, the top disc furthest.
lumen({
  name: "depth",
  means: "Four flat cylinders stacked, the top lit at its core. On hover the stack sinks, the top disc furthest.",
  rules: [2, 3, 4, 11],
  draw(L) {
    const { cyl, fade, glow, move } = L;
    const disc = (y) => cyl(100, y, 52, 16, 12, { top: glow("air", "mid"), body: fade("mist", "mid", 90) });
    const d4 = disc(128);
    const d3 = disc(108);
    const d2 = disc(88);
    const d1 = cyl(100, 68, 52, 16, 12, { top: glow("core", "mid"), body: fade("mid", "core", 90) });
    move([d1, d2, d3, d4], "drift", { dy: [14, 9, 5, 2], step: 0.06 });
  },
});
