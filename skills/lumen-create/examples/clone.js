// A copy: a deep square, its paler twin offset up and right, and the pale hollow ghost of the next. On hover: the copies slide back towards the original, one after the other.
lumen({
  name: "clone",
  means: "A deep square, its paler copy and the pale hollow ghost of the next. On hover the copies slide back towards the original in turn.",
  rules: [2, 4, 7, 11],
  draw(L) {
    const { rect, fade, glow, move } = L;
    const ghost = rect(112, 26, 64, 64, glow("air", "mid"));
    const twin = rect(76, 52, 64, 64, fade("air", "mid", 135));
    rect(40, 88, 64, 64, fade("soft", "core", 100));
    move([twin, ghost], "drift", { dx: [-14, -10], dy: [14, 10], step: 0.12 });
  },
});
