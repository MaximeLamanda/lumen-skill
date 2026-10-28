// A step: three squares grown from one corner. On hover: the squares grow from the corner, the smallest first.
lumen({
  name: "scale",
  means: "Three squares grown from one corner. On hover they swell from that corner, the smallest first.",
  rules: [2, 4, 11],
  draw(L) {
    const { rect, fade, move } = L;
    const big = rect(53, 56, 94, 94, fade("air", "deep", 135));
    const mid = rect(53, 88, 62, 62, fade("mist", "mid", 20));
    const small = rect(53, 118, 32, 32, fade("mid", "core", 60));
    move([small, mid, big], "swell", { to: [1.2, 1.14, 1.07], cx: 53, cy: 150, step: 0.1 });
  },
});
