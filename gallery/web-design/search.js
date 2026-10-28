// An object: a magnifier, a hollow glass, and the result lit inside it, the core. On hover: the result sweeps across the glass and the lens swells.
lumen({
  name: "search",
  means: "A magnifier with a lit result inside its glass. On hover the result sweeps across the glass and the lens swells.",
  draw(L) {
    const { ring, disc, beam, fade, glow, move } = L;
    beam(122, 122, 162, 162, 14, 14, fade("mist", "deep"));
    const lens = ring(88, 88, 44, 34, fade("mist", "deep", 120));
    const glass = disc(88, 88, 34, glow("air", "mid"));
    const found = disc(72, 72, 8, glow("core", "core", "mid"));
    move(found, "drift", { dx: 18, dy: 16, dur: 0.9 });
    move([lens, glass], "swell", { to: 1.05 });
  },
});
