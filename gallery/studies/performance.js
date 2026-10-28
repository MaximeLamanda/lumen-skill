// A form that speeds up: three lenses growing, the largest holding the core. On hover: a swell runs through the lenses, smallest to largest.
lumen({
  name: "performance",
  means: "Three lenses growing, the largest the deepest. On hover a swell runs through them, smallest to largest.",
  rules: [2, 4, 7, 11],
  draw(L) {
    const { oval, fade, move } = L;
    const large = oval(124, 100, 24, 58, fade("mist", "core", 100));
    const medium = oval(90, 100, 17, 44, fade("mist", "mid", 100));
    const small = oval(62, 100, 11, 30, fade("mist", "mid", 100));
    move([small, medium, large], "swell", { to: 1.12, step: 0.09 });
  },
});
