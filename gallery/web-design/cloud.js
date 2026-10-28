// An object: a cloud in one piece, and under it a lit point of data with a beam rising into the cloud. On hover: the beam climbs into the cloud and dissolves, the point swells, the cloud swells to take it.
lumen({
  name: "cloud",
  means: "A cloud in one piece with a lit point of data under it and a beam rising into the cloud. On hover the beam climbs and dissolves, and the cloud swells.",
  draw(L) {
    const { curve, disc, beam, fade, glow, move } = L;
    const at = ([x, y]) => [x - 10, y - 18];
    const cloud = curve(
      [[58, 126], [54, 110], [64, 97], [80, 94], [86, 80], [102, 68], [124, 70], [136, 84], [152, 88], [166, 102], [164, 118], [152, 126]].map(at),
      fade("air", "mid", 90),
      [0, 11],
    );
    const rise = beam(100, 138, 100, 106, 16, 5, fade("mid", "air"));
    const data = disc(100, 146, 9, glow("core", "core", "mid"));
    move(rise, "drift", { dy: -12, fade: 0, dur: 0.7 });
    move(data, "swell", { to: 1.2, delay: 0.1 });
    move(cloud, "swell", { to: 1.05, delay: 0.3 });
  },
});
