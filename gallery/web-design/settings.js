// A form that meshes: two gears, the big one's hub the core. On hover: the gears turn by half a tooth, in opposite ways, and the hub swells.
lumen({
  name: "settings",
  means: "Two meshing gears, the hub of the big one the deepest. On hover the gears turn by half a tooth in opposite ways and the hub swells.",
  draw(L) {
    const { poly, disc, fade, glow, move } = L;
    const gear = (cx, cy, rOut, rIn, teeth) => {
      const p = [], step = 360 / teeth;
      for (let k = 0; k < teeth; k++) {
        for (const [da, r] of [[-0.3, rIn], [-0.18, rOut], [0.18, rOut], [0.3, rIn]]) {
          const t = ((k + da) * step * Math.PI) / 180;
          p.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]);
        }
      }
      return p;
    };
    const big = poly(gear(82, 87, 46, 38, 8), fade("mist", "deep", 100));
    const small = poly(gear(134, 129, 30, 24, 6), fade("soft", "deep", 100));
    const hub = disc(82, 87, 14, glow("core", "mid"));
    disc(134, 129, 8, glow("mist", "mid"));
    move([big, small], "spin", { by: [22.5, -30], cx: [82, 134], cy: [87, 129], dur: [1, 0.9] });
    move(hub, "swell", { to: 1.14, delay: 0.1 });
  },
});
