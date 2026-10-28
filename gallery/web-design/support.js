// An object: two chat bubbles, the second the core, with three dots typing in it. On hover: the bubbles ease apart as the answer arrives.
lumen({
  name: "support",
  means: "Two chat bubbles, the second the deepest, with three dots in it. On hover the bubbles ease apart as the answer arrives.",
  draw(L) {
    const { poly, glyph, fade, move } = L;
    // a bubble and its tail in one outline, so they share one gradient and meet without a seam
    const bubble = (x, y, w, h, r, tail) => {
      const p = [];
      const corner = (cx, cy, from) => {
        for (let k = 0; k <= 6; k++) {
          const a = ((from + k * 15) * Math.PI) / 180;
          p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
        }
      };
      corner(x + r, y + r, 180);
      corner(x + w - r, y + r, 270);
      corner(x + w - r, y + h - r, 0);
      p.push([tail[1], y + h], [tail[2], tail[3]], [tail[0], y + h]);
      corner(x + r, y + h - r, 90);
      return p;
    };
    const back = poly(bubble(36, 48, 90, 60, 14, [50, 66, 42, 126]), fade("mist", "mid", 90));
    const front = poly(bubble(76, 84, 90, 60, 14, [134, 150, 160, 162]), fade("soft", "core", 90));
    const dots = glyph("dots", 121, 114, 40, { paper: true });
    move([back, front, dots], "drift", { dx: [-8, 8, 8], dy: [-6, 6, 6], step: 0.06 });
  },
});
