// An object: a padlock closed on its shackle, the keyhole the one dense point. On hover: the shackle clicks home and the keyhole swells.
lumen({
  name: "security",
  means: "A closed padlock, its keyhole the one dense point. On hover the shackle clicks home and the keyhole swells.",
  rules: [2, 4, 6, 11],
  draw(L) {
    const { poly, rect, disc, fade, glow, move } = L;
    const arc = (r, from, to) => Array.from({ length: 19 }, (_, i) => {
      const a = ((from + ((to - from) * i) / 18) * Math.PI) / 180;
      return [100 + r * Math.cos(a), 66 + r * Math.sin(a)];
    });
    const shackle = poly([...arc(30, 180, 360), [130, 88], [118, 88], ...arc(18, 360, 180), [82, 88], [70, 88]], fade("mist", "mid", 90));
    rect(54, 88, 92, 66, fade("air", "mid", 100), 9);
    const eye = disc(100, 112, 9, glow("core", "core", "mid"));
    const slot = poly([[95.5, 118], [104.5, 118], [108, 138], [92, 138]], fade("mid", "core", "core", 90));
    move(shackle, "drift", { dy: 5, dur: 0.4 });
    move([eye, slot], "swell", { to: 1.18, cx: 100, cy: 120, delay: 0.15 });
  },
});
