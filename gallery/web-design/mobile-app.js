// An object: a phone, its glass screen, three cards, the first the core. On hover: the cards scroll up, the first leaving the screen.
lumen({
  name: "mobile-app",
  means: "A phone with a glass screen and three cards, the first the deepest. On hover the cards scroll up and the first leaves the screen.",
  draw(L) {
    const { rect, disc, fade, glow, move } = L;
    rect(64, 30, 72, 140, fade("mist", "mid", 90), 16);
    rect(71, 40, 58, 114, glow("air", "mid"), 9);
    const cards = [
      rect(77, 48, 46, 24, fade("mid", "core", 90), 6),
      rect(77, 80, 46, 18, fade("mist", "mid", 90), 5),
      rect(77, 106, 30, 18, fade("mist", "mid", 90), 5),
    ];
    disc(100, 163, 4.5, glow("mist", "mid"));
    move(cards, "drift", { dy: [-16, -12, -8], fade: [0, 1, 1], step: 0.08 });
  },
});
