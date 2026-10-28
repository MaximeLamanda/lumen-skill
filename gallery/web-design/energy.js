// A form that radiates: a lit disc, a bolt at its core, six beams. On hover: the beams burst outward and fade, the bolt and the disc swell.
lumen({
  name: "energy",
  means: "A lit disc with a bolt at its core and six beams. On hover the beams burst outward and fade while the bolt and the disc swell.",
  draw(L) {
    const { disc, poly, beam, fade, glow, move } = L;
    const rays = [], dx = [], dy = [];
    const glowDisc = disc(100, 100, 44, glow("mist", "mid"));
    for (const a of [-90, -30, 30, 90, 150, 210]) {
      const c = Math.cos((a * Math.PI) / 180), s = Math.sin((a * Math.PI) / 180);
      rays.push(beam(100 + 52 * c, 100 + 52 * s, 100 + 74 * c, 100 + 74 * s, 9, 2, fade("mid", "air")));
      dx.push(9 * c);
      dy.push(9 * s);
    }
    const bolt = poly([[106, 68], [84, 100], [98, 100], [90, 132], [116, 90], [101, 90], [110, 68]], fade("mid", "core", 90));
    move(rays, "drift", { dx, dy, fade: 0.2, dur: 0.6 });
    move(bolt, "swell", { to: 1.14, delay: 0.1 });
    move(glowDisc, "swell", { to: 1.06, delay: 0.2 });
  },
});
