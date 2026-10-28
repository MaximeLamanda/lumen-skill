// An object: an envelope holding a sealed card. Three masses and one glyph. On hover: the card rises out of the envelope.
lumen({
  name: "offer",
  means: "An envelope with a card rising from it, sealed with a star. On hover the card lifts further out of the envelope.",
  rules: [2, 4, 10, 11],
  draw(L) {
    const { rect, poly, fade, glow, glyph, move } = L;
    const sheet = rect(72, 42, 58, 66, fade("air", "mid", 90), 2);
    const seal = poly([[101, 62], [132, 87], [101, 112], [70, 87]], glow("core", "mid"));
    poly([[56, 90], [101, 112], [146, 90], [146, 150], [56, 150]], fade("mist", "core", 90));
    const star = glyph("star", 101, 87, 16, { paper: true });
    move([sheet, seal, star], "drift", { dy: -12 });
  },
});
