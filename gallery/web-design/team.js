// A form that gathers: three people, the one in the middle the core. On hover: the two at the sides step in towards the middle and the middle one swells.
lumen({
  name: "team",
  means: "Three people, the one in the middle the deepest. On hover the two at the sides step in towards the middle and the middle one swells.",
  draw(L) {
    const { disc, curve, fade, glow, move } = L;
    const person = (cx, baseY, s, headPaint, bodyPaint) => {
      const head = disc(cx, baseY - 50 * s, 13 * s, headPaint);
      const body = curve(
        [[cx - 26 * s, baseY], [cx - 26 * s, baseY - 16 * s], [cx - 14 * s, baseY - 30 * s], [cx, baseY - 34 * s], [cx + 14 * s, baseY - 30 * s], [cx + 26 * s, baseY - 16 * s], [cx + 26 * s, baseY]],
        bodyPaint,
        [0, 6],
      );
      return [head, body];
    };
    const [lh, lb] = person(56, 128, 0.8, glow("mist", "mid"), fade("mist", "mid", 90));
    const [rh, rb] = person(144, 128, 0.8, glow("mist", "mid"), fade("mist", "mid", 90));
    const [ch, cb] = person(100, 136, 1.1, glow("core", "mid"), fade("soft", "deep", 90));
    move([lh, lb, rh, rb], "drift", { dx: [10, 10, -10, -10], step: 0.05 });
    move([ch, cb], "swell", { to: 1.06, cx: 100, cy: 136, delay: 0.1 });
  },
});
