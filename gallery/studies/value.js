// A cut stone: four facets, the upper left holding the core. On hover: the stone swells, the lit facet leading.
lumen({
  name: "value",
  means: "A diamond of four facets, the upper left the deepest. On hover the stone swells, the lit facet first.",
  rules: [2, 3, 4, 11],
  draw(L) {
    const { poly, fade, move } = L;
    const T = [100, 36], Lf = [46, 100], R = [154, 100], B = [100, 164], F = [100, 110];
    const facets = [
      poly([T, R, F], fade("mist", "mid", 100)),
      poly([F, R, B], fade("mist", "mid", 60)),
      poly([Lf, B, F], fade("soft", "deep", 100)),
      poly([T, Lf, F], fade("mid", "core", 120)),
    ];
    move([facets[3], facets[0], facets[2], facets[1]], "swell", { to: 1.08, cx: 100, cy: 100, step: 0.07 });
  },
});
