// A stack: four plates, the top one deepest. On hover: the stack opens, the top plate first.
lumen({
  name: "layers",
  means: "Four translucent plates stacked, the top one deepest. On hover the stack opens apart, the top plate first.",
  rules: [2, 3, 7, 11],
  draw(L) {
    const { box, fade, glow, move } = L;
    const plate = (y, top, left, right) => box(100, y, 66, 66, 5, { top, left, right });
    const p1 = plate(136, glow("air", "mid"), fade("mist", "mid", 90), fade("air", "mid", 90));
    const p2 = plate(120, glow("air", "mid"), fade("mist", "mid", 90), fade("air", "mid", 90));
    const p3 = plate(104, glow("air", "mid"), fade("soft", "deep", 90), fade("mist", "mid", 90));
    const p4 = plate(88, glow("air", "core"), fade("mid", "core", 90), fade("soft", "deep", 90));
    move([p4, p3, p2, p1], "drift", { dy: [-12, -5, 5, 12], step: 0.07 });
  },
});
