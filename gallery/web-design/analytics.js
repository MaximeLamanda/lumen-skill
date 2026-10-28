// A form that grows: four bars, each taller than the last, the last lit at its peak (the core), and the pale hollow ghost of the target behind it. On hover: the bars grow from their base in turn, then the target.
lumen({
  name: "analytics",
  means: "Four bars, each taller than the last, the last lit at its peak, with the pale hollow ghost of a target behind it. On hover the bars grow from their base in turn, then the target.",
  draw(L) {
    const { rect, fade, glow, move } = L;
    const base = 156, heights = [40, 62, 86, 114], xs = [44, 76, 108, 140];
    const target = rect(140, 30, 24, 126, glow("air", "mid"), 6);
    const bars = heights.map((h, i) => rect(xs[i], base - h, 24, h, i < 3 ? fade("mist", "mid", 90) : fade("soft", "core", 270), 6));
    move(bars, "swell", { to: 1.12, cx: xs.map((x) => x + 12), cy: base, step: 0.07 });
    move(target, "swell", { to: 1.08, cx: 152, cy: base, delay: 0.3 });
  },
});
