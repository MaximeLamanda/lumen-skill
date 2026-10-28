// An object: an envelope with its flap, and the notification badge that is its core. On hover: the flap lifts away, the badge swells.
lumen({
  name: "mail",
  means: "An envelope with a notification badge at its corner. On hover the flap lifts away and the badge swells.",
  draw(L) {
    const { rect, poly, disc, fade, glow, move } = L;
    rect(40, 64, 120, 80, fade("air", "mid", 90), 9);
    const flap = poly([[48, 66], [152, 66], [100, 114]], fade("mist", "deep", 90));
    const badge = disc(150, 66, 14, glow("core", "core", "mid"));
    move(flap, "drift", { dy: -10, fade: 0.35 });
    move(badge, "swell", { to: 1.25 });
  },
});
