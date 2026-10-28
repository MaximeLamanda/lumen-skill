// An object: a card with its stripe and chip, the chip the core, in front of a hollow ghost of a second card. On hover: the card advances and the ghost steps back.
lumen({
  name: "payment",
  means: "A card with a stripe and a chip, in front of the pale hollow ghost of a second card. On hover the card advances and the ghost steps back.",
  draw(L) {
    const { rect, fade, glow, move } = L;
    const ghost = rect(36, 52, 112, 72, glow("air", "mid"), 10);
    const card = rect(52, 76, 112, 72, fade("mist", "deep", 120), 10);
    const stripe = rect(52, 92, 112, 14, fade("soft", "deep", 0), 0);
    const chip = rect(66, 116, 20, 16, fade("mid", "core", 90), 4);
    move([card, stripe, chip], "drift", { dx: 10, dy: -8 });
    move(ghost, "drift", { dx: -8, dy: 6, delay: 0.1 });
  },
});
