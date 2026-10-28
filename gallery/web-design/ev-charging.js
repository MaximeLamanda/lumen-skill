// An object: a charging post with three level pills and a bolt lit at its core, a cable and a plug. On hover: the plug docks, the pills fill in turn and the bolt swells.
lumen({
  name: "ev-charging",
  means: "A charging post with three level pills and a bolt at its core, a cable and a plug. On hover the plug docks, the pills fill in turn and the bolt swells.",
  draw(L) {
    const { rect, poly, arc, fade, move } = L;
    rect(50, 34, 56, 124, fade("air", "mid", 90), 14);
    const pills = [46, 58, 70].map((y) => rect(62, y, 32, 8, fade("mist", "mid", 0), 4));
    const bolt = poly([[88, 86], [66, 118], [80, 118], [72, 150], [98, 108], [83, 108], [92, 86]], fade("mid", "core", 90));
    arc(128, 118, 22, 6, 90, 180, fade("mist", "mid", 90));
    const plug = rect(124, 132, 34, 16, fade("soft", "deep", 90), 5);
    const tip = rect(158, 136, 10, 8, fade("soft", "deep", 0), 2);
    move([plug, tip], "drift", { dx: -17, dy: -6, step: 0.05 });
    move(pills, "swell", { to: 1.22, step: 0.1, delay: 0.15 });
    move(bolt, "swell", { to: 1.14, delay: 0.3 });
  },
});
