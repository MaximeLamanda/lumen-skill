// A cluster of cubes: five on an isometric grid, the top one holding the core, and the pale hollow ghost of the cube that is missing, drawn as a cube in its own place in the depth. On hover: the cubes come apart along their axes, the ghost with them.
lumen({
  name: "matrix",
  means: "Five cubes on an isometric grid, the high one deepest, and the pale hollow ghost of the missing cube. On hover they all come apart.",
  rules: [2, 3, 4, 7, 11],
  draw(L) {
    const { box, fade, glow, move } = L;
    const s = 28, c = Math.cos(Math.PI / 6) * s;
    const at = (i, j, k) => [100 + (i - j) * c, 128 - (i + j) * (s / 2) - k * s];
    const cube = (i, j, k, tones) => box(...at(i, j, k), s, s, s, tones);
    const base = { top: fade("air", "mid", 90), left: fade("soft", "deep", 90), right: fade("mist", "mid", 90) };
    const ghost = { top: glow("air", "mid"), left: fade("air", "mid", 90), right: fade("air", "mid", 90) };
    // back to front, so the ghost sits behind the cubes in front of it and in front of the one below
    const cubes = [
      cube(1, 1, 0, base),
      cube(1, 1, 1, ghost),
      cube(1, 0, 0, base),
      cube(0, 1, 0, base),
      cube(0, 1, 1, { top: fade("mist", "deep", 90), left: fade("mid", "core", 90), right: fade("soft", "deep", 90) }),
      cube(0, 0, 0, base),
    ];
    move(cubes, "drift", { dx: [0, 0, 10, -10, -10, 0], dy: [-12, -22, -6, -6, -16, 6], step: 0.06 });
  },
});
