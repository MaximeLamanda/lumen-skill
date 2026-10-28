// A spread: one lit core linked by four tapered beams to four spheres. On hover: the beams slip outward and dissolve, and the spheres swell as they receive.
lumen({
  name: "deploy",
  means: "A lit core linked by four tapered beams to four spheres. On hover the beams slip outward and dissolve, and the spheres swell.",
  rules: [2, 4, 5, 11],
  draw(L) {
    const { disc, beam, glow, fade, move } = L;
    const spheres = [], beams = [], dx = [], dy = [];
    for (const a of [45, 135, 225, 315]) {
      const c = Math.cos((a * Math.PI) / 180), s = Math.sin((a * Math.PI) / 180);
      beams.push(beam(100 + 22 * c, 100 + 22 * s, 100 + 52 * c, 100 + 52 * s, 8, 3, fade("mid", "air")));
      spheres.push(disc(100 + 68 * c, 100 + 68 * s, 14, glow("mist", "mid", 0.35, 0.3)));
      dx.push(14 * c);
      dy.push(14 * s);
    }
    disc(100, 100, 17, glow("core", "mid"));
    move(beams, "drift", { dx, dy, fade: 0, dur: 0.6 });
    move(spheres, "swell", { to: 1.16, delay: 0.3 });
  },
});
