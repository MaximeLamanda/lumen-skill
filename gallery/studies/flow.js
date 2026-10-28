// A current: a lit disc whose core radiates, and three open ribbons that wind round it. On hover: the disc swells and the ribbons turn, each by its own angle at its own pace.
lumen({
  name: "flow",
  means: "A disc lit from its core, wound by three open ribbons. On hover the disc swells and the ribbons turn, each by its own angle.",
  rules: [2, 4, 5, 11, 13],
  draw(L) {
    const { disc, arc, glow, fade, move } = L;
    const lit = disc(100, 100, 60, glow("core", "mist"));
    const outer = arc(100, 100, 50, 5, 100, 380, fade("soft", "deep", 100));
    const middle = arc(100, 100, 38, 5, 20, 300, fade("soft", "deep", 60));
    const inner = arc(100, 100, 26, 5, -60, 230, fade("soft", "deep", 140));
    move(lit, "swell", { to: 1.08, dur: 0.9 });
    move([outer, middle, inner], "spin", { by: [110, -170, 240], dur: [1.1, 0.95, 0.8] });
  },
});
