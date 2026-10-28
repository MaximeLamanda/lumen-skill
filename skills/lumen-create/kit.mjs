/**
 * The Lumen kit: the mechanics under every piece. It draws, measures and writes the css; it does not
 * change when your taste does (that is `style.mjs`, which is yours to edit).
 *
 * A piece is written against `L`, the object `createKit()` returns, and ends with
 * `lumen({ name, means, draw })`. The kit owns what makes a piece Lumen: the one ink on its paper, the
 * levels the ink may take, the gradient every mass has, the grain, the 200 x 200 frame. A piece never
 * writes markup, a colour, a filter or css: it names a level and calls a shape.
 *
 * What the kit refuses is only what cannot be drawn (a missing paint, a number that is not one, an
 * unknown level). What is a matter of taste or of readability is a warning, with the limit in style.mjs.
 *
 * INDEX: everything a piece may call. Read this and nothing under it.
 *
 *   Paints (every mass takes one; there is no flat fill)
 *     fade(from, to[, angle])     linear. Ink at level `from` at the start, `to` at the end.
 *                                 angle in degrees: 0 runs right, 90 runs down. Default 100.
 *     fade(a, b, c[, angle])      the same with a middle stop
 *     glow(from, to[, cx, cy])    radial. `from` at (cx, cy) in the shape's box (0..1, default the
 *                                 centre), `to` at its far edge. Also glow(a, b, c[, cx, cy]).
 *     levels: core 1 . deep .78 . mid .52 . soft .3 . mist .14 . air .03 (style.mjs)
 *             the two ends of a paint should be at least .35 apart, or it reads flat (a warning)
 *
 *   Masses (the paint is the last argument)
 *     disc(cx, cy, r, paint)
 *     oval(cx, cy, rx, ry, paint[, rot])
 *     ring(cx, cy, r, hole, paint)
 *     rect(x, y, w, h, paint[, radius])
 *     poly(points, paint)                    points: [[x, y], ...]
 *     curve(points, paint[, corners])        smooth closed curve through the points;
 *                                            corners: indexes of points that stay sharp
 *     box(cx, cy, w, d, h[, tones])          isometric box; (cx, cy) is the middle of its hexagon;
 *                                            tones: { top, left, right }, each a paint
 *     cyl(cx, cy, rx, ry, h[, tones])        cylinder; (cx, cy) is the middle of its top ellipse;
 *                                            tones: { top, body }
 *
 *   Ribbons and beams: what a line would have said, said with a mass
 *     band(cx, cy, rx, ry, w, paint[, rot])  an elliptical ribbon of width w: a path, an orbit
 *     arc(cx, cy, r, w, from, to, paint)     an open ribbon with round ends, angles in degrees
 *     beam(x1, y1, x2, y2, w1, w2, paint)    a tapered beam from w1 wide to w2 wide: a link, a ray.
 *                                            A fade runs along it, from its start to its end.
 *     A ghost, what is not there yet, is a pale hollow mass: glow("air", "mid"). The ghost of a solid
 *     is the same solid (box, cyl) with hollow tones, at its own place in the depth order.
 *
 *   Lines (only when style.lines.allowed is true; otherwise each throws a message that says so)
 *     line(points[, opts])                   opts: { dash, soft, paper }
 *     orbit(cx, cy, rx, ry[, opts])          also opts.rot, and opts.arc = [from, to] in degrees
 *     frame(x, y, w, h[, opts])              also opts.radius
 *     hull(points[, opts])                   an outlined polygon
 *     axes(x0, y0, x1, y1[, opts])           an L from (x0, y0) down to (x0, y1) and across to (x1, y1)
 *     arrow(x1, y1, x2, y2[, opts])          only when style.lines.arrows is true too
 *
 *   Mark (one per piece; filled, in ink, or `paper` on a deep mass)
 *     glyph(kind, cx, cy, size[, opts])      star, dots, play (and plus, check, percent when lines are allowed)
 *
 *   Helpers
 *     rot(points, deg, cx, cy)               the points turned about (cx, cy)
 *     rand(seed)                             a seeded generator: rand(7)() is the same number every run.
 *                                            Math.random is off so that a piece draws the same every time.
 *
 *   Motion (optional)
 *     Every mass, line and mark above returns a handle. Give it to move().
 *     move(handles, kind[, opts])            handles: one, or an array. One move per part.
 *       "drift"   goes out by (dx, dy)
 *       "swell"   a mass grows to opts.to about its own centre, or about (cx, cy)
 *       "spin"    turns by opts.by degrees (default 90) about (cx, cy), default the frame's centre
 *     opts.fade    the opacity it goes to (0 to 1, default 1): a part can dissolve as it moves
 *     opts.dur     seconds it takes to get there (default .7);  opts.delay seconds before it starts;
 *                  opts.step adds step x index to the delay, for a stagger
 *     opts.dx, dy, to, by, fade, dur, delay, cx, cy may each be an array: one value per handle
 *     By default a part answers the hover: two poses, rest and hover, and the css moves between them
 *     with a transition that can be interrupted at any moment. The trigger is the svg itself (inline in
 *     a page), or any ancestor with the class "lm-host", on hover and on keyboard focus. The rest pose
 *     is the still piece, and what a viewer sees with reduced motion.
 *     opts.loop    (only when style.motion.loops is true) runs the move on a loop instead, of that many
 *                  seconds (true means 6): spin turns for ever, drift and swell go out and come back.
 *
 * Painting is back to front, in the order of the calls. Ink is translucent, so
 * what overlaps gets deeper: that is how depth is made here.
 */
import { STYLE } from "./style.mjs";

export { STYLE };
export const PAPER = STYLE.palette.paper;
export const INK = STYLE.palette.ink;
export const LINE = STYLE.palette.line;
export const LEVELS = STYLE.levels;
export const SIZE = 200;
export const MIN_SPAN = STYLE.limits.gradientSpan;
export const MOVES = ["drift", "swell", "spin"];
export const EASE = STYLE.motion.ease;
export const TIMING = { enter: STYLE.motion.enter, leave: STYLE.motion.leave, min: STYLE.limits.duration[0], max: STYLE.limits.duration[1], total: STYLE.limits.gesture };
export const REACH = { shift: STYLE.limits.shift, scaleMin: STYLE.limits.scale[0], scaleMax: STYLE.limits.scale[1], turn: STYLE.limits.turn };
export const GLYPHS = STYLE.lines.allowed ? ["star", "dots", "play", "plus", "check", "percent"] : ["star", "dots", "play"];
const LOOP_EASE = "cubic-bezier(.65,0,.35,1)";

const f = (v) => String(+v.toFixed(2));
const pts = (a) => a.map((p) => `${f(p[0])},${f(p[1])}`).join(" ");
const hash = (s) => {
  let h = 2166136261;
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0).toString(36);
};
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function num(who, ...vals) {
  for (const v of vals) {
    if (typeof v !== "number" || !Number.isFinite(v)) throw new Error(`lumen: ${who} needs numbers, got ${v}`);
  }
}
function list(who, a, min) {
  if (!Array.isArray(a) || a.length < min || a.some((p) => !Array.isArray(p) || p.length !== 2 || !Number.isFinite(p[0]) || !Number.isFinite(p[1]))) {
    throw new Error(`lumen: ${who} needs at least ${min} points as [[x, y], ...]`);
  }
}
const boxOf = (a) => [Math.min(...a.map((p) => p[0])), Math.min(...a.map((p) => p[1])), Math.max(...a.map((p) => p[0])), Math.max(...a.map((p) => p[1]))];
const grow = (b, c) => (b ? [Math.min(b[0], c[0]), Math.min(b[1], c[1]), Math.max(b[2], c[2]), Math.max(b[3], c[3])] : c.slice());
const level = (n) => {
  if (!(n in LEVELS)) throw new Error(`lumen: unknown level "${n}". The levels are ${Object.keys(LEVELS).join(", ")}`);
  return LEVELS[n];
};

/** The grain: one filter for the whole set. It speckles the ink's own opacity, so it shows where the fade is. Its look is style.mjs's. */
const k1 = STYLE.grain.strength;
const GRAIN = `<filter id="lm-grain" filterUnits="userSpaceOnUse" x="0" y="0" width="${SIZE}" height="${SIZE}" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="${STYLE.grain.frequency}" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 1.8 0 0 0 -.15" result="g"/><feComposite in="SourceGraphic" in2="g" operator="arithmetic" k1="${k1}" k2="${1 - k1}" k3="0" k4="0"/></filter>`;

export function createKit() {
  const nodes = [];
  const grads = new Map();
  const warnings = [];
  const stats = { parts: 0, lines: 0, glyphs: 0, fades: [] };
  let mass = null;
  let all = null;
  /** What is a matter of taste or of readability is noted, not refused. */
  const warn = (code, msg) => warnings.push({ code, msg });

  // paints
  const stopsOf = (names, who) => {
    if (names.length < 2 || names.length > 3) throw new Error(`lumen: ${who} takes two or three levels`);
    const lv = names.map(level);
    const span = Math.max(...lv) - Math.min(...lv);
    if (span < MIN_SPAN) warn("flat", `${who}(${names.join(", ")}) spans ${span.toFixed(2)}, under ${MIN_SPAN}: the paint reads nearly flat (rule 02)`);
    return lv;
  };
  const fade = (...args) => {
    let angle = 100;
    if (typeof args.at(-1) === "number") angle = args.pop();
    return { type: "fade", names: args, stops: stopsOf(args, "fade"), angle };
  };
  const glow = (...args) => {
    const nums = [];
    while (typeof args.at(-1) === "number") nums.unshift(args.pop());
    const [cx = 0.5, cy = 0.5] = nums;
    return { type: "glow", names: args, stops: stopsOf(args, "glow"), cx, cy };
  };
  const ref = (p, who, track = true) => {
    if (!p || (p.type !== "fade" && p.type !== "glow")) throw new Error(`lumen: ${who} needs a paint from fade() or glow() as its last argument. Ink is never flat (rule 02)`);
    const key = JSON.stringify([p.type, p.names, p.angle, p.cx, p.cy]);
    if (!grads.has(key)) {
      const id = `lm-${hash(key)}`; // from the content, so two pieces inlined in one page never clash
      const last = p.stops.length - 1;
      const stops = p.stops.map((v, i) => `<stop offset="${f(i / last)}" stop-color="${INK}" stop-opacity="${v}"/>`).join("");
      let tag;
      if (p.type === "fade") {
        const a = (p.angle * Math.PI) / 180;
        const dx = Math.cos(a) / 2;
        const dy = Math.sin(a) / 2;
        tag = `<linearGradient id="${id}" x1="${f(0.5 - dx)}" y1="${f(0.5 - dy)}" x2="${f(0.5 + dx)}" y2="${f(0.5 + dy)}">${stops}</linearGradient>`;
      } else {
        const r = 0.5 + Math.hypot(p.cx - 0.5, p.cy - 0.5);
        tag = `<radialGradient id="${id}" cx="${f(p.cx)}" cy="${f(p.cy)}" r="${f(r)}">${stops}</radialGradient>`;
      }
      grads.set(key, { id, tag });
    }
    if (track && p.type === "fade") stats.fades.push(p.angle);
    return `url(#${grads.get(key).id})`;
  };

  const put = (kind, svg, box, count = true, meta = {}) => {
    nodes.push({ kind, svg, box, move: null, ...meta });
    if (kind === "mass") {
      if (count) stats.parts++;
      mass = grow(mass, box);
    } else if (kind === "line" && count) stats.lines++;
    all = grow(all, box);
    return nodes.length - 1;
  };

  // masses
  const disc = (cx, cy, r, p) => {
    num("disc", cx, cy, r);
    return put("mass", `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}" fill="${ref(p, "disc")}"/>`, [cx - r, cy - r, cx + r, cy + r], true, { ball: [cx, cy, r] });
  };
  const reach = (rx, ry, deg) => {
    const a = (deg * Math.PI) / 180;
    return [Math.hypot(rx * Math.cos(a), ry * Math.sin(a)), Math.hypot(rx * Math.sin(a), ry * Math.cos(a))];
  };
  const oval = (cx, cy, rx, ry, p, rot = 0) => {
    num("oval", cx, cy, rx, ry, rot);
    const [hx, hy] = reach(rx, ry, rot);
    const t = rot ? ` transform="rotate(${f(rot)} ${f(cx)} ${f(cy)})"` : "";
    return put("mass", `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}"${t} fill="${ref(p, "oval")}"/>`, [cx - hx, cy - hy, cx + hx, cy + hy]);
  };
  const circlePath = (cx, cy, r) => `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;
  const ring = (cx, cy, r, hole, p) => {
    num("ring", cx, cy, r, hole);
    if (hole >= r) throw new Error("lumen: ring's hole must be smaller than its radius");
    return put("mass", `<path d="${circlePath(cx, cy, r)}${circlePath(cx, cy, hole)}" fill-rule="evenodd" fill="${ref(p, "ring")}"/>`, [cx - r, cy - r, cx + r, cy + r], true, { ball: [cx, cy, r] });
  };
  const rect = (x, y, w, h, p, radius = 0) => {
    num("rect", x, y, w, h, radius);
    const rr = radius ? ` rx="${f(radius)}"` : "";
    return put("mass", `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"${rr} fill="${ref(p, "rect")}"/>`, [x, y, x + w, y + h]);
  };
  const poly = (points, p) => {
    list("poly", points, 3);
    return put("mass", `<polygon points="${pts(points)}" fill="${ref(p, "poly")}"/>`, boxOf(points));
  };
  const curve = (points, p, corners = []) => {
    list("curve", points, 3);
    const n = points.length;
    let d = `M${f(points[0][0])} ${f(points[0][1])}`;
    for (let i = 0; i < n; i++) {
      const p0 = points[(i - 1 + n) % n], p1 = points[i], p2 = points[(i + 1) % n], p3 = points[(i + 2) % n];
      const c1 = corners.includes(i) ? p1 : [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = corners.includes((i + 1) % n) ? p2 : [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
    }
    return put("mass", `<path d="${d}Z" fill="${ref(p, "curve")}"/>`, boxOf(points));
  };
  const box = (cx, cy, w, d, h, tones = {}) => {
    num("box", cx, cy, w, d, h);
    const t = {
      top: tones.top ?? fade("mist", "soft", 90),
      left: tones.left ?? fade("soft", "deep", 90),
      right: tones.right ?? fade("mist", "mid", 90),
    };
    const c = Math.cos(Math.PI / 6), s = 0.5;
    const vx = [c * w, -s * w], vy = [-c * d, -s * d], vz = [0, -h];
    const o = [cx - (vx[0] + vy[0]) / 2 - vz[0] / 2, cy - (vx[1] + vy[1]) / 2 - vz[1] / 2];
    const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
    const T0 = add(o, vz), T1 = add(T0, vx), T2 = add(T1, vy), T3 = add(T0, vy);
    const X = add(o, vx), XZ = add(X, vz), Y = add(o, vy), YZ = add(Y, vz);
    const faces = [
      [[o, Y, YZ, T0], t.left],
      [[o, X, XZ, T0], t.right],
      [[T0, T1, T2, T3], t.top],
    ];
    const svg = faces.map(([a, p]) => `<polygon points="${pts(a)}" fill="${ref(p, "box")}"/>`).join("");
    return put("mass", svg, boxOf([o, X, XZ, Y, YZ, T0, T1, T2, T3]));
  };
  const cyl = (cx, cy, rx, ry, h, tones = {}) => {
    num("cyl", cx, cy, rx, ry, h);
    const t = { top: tones.top ?? glow("deep", "mist"), body: tones.body ?? fade("mist", "deep", 90) };
    const body = `M${f(cx - rx)} ${f(cy)}L${f(cx - rx)} ${f(cy + h)}A${f(rx)} ${f(ry)} 0 0 0 ${f(cx + rx)} ${f(cy + h)}L${f(cx + rx)} ${f(cy)}Z`;
    const svg = `<path d="${body}" fill="${ref(t.body, "cyl")}"/><ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${ref(t.top, "cyl")}"/>`;
    return put("mass", svg, [cx - rx, cy - ry, cx + rx, cy + h + ry]);
  };

  // what a line would have said, said with a mass
  const ellipsePath = (cx, cy, rx, ry) => `M${f(cx - rx)} ${f(cy)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2 * rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2 * rx)} 0Z`;
  const band = (cx, cy, rx, ry, w, p, rot = 0) => {
    num("band", cx, cy, rx, ry, w, rot);
    if (w <= 0 || w >= Math.min(rx, ry)) throw new Error("lumen: a band's width lies between 0 and its smaller radius");
    const [hx, hy] = reach(rx, ry, rot);
    const t = rot ? ` transform="rotate(${f(rot)} ${f(cx)} ${f(cy)})"` : "";
    return put("mass", `<path d="${ellipsePath(cx, cy, rx, ry)}${ellipsePath(cx, cy, rx - w, ry - w)}" fill-rule="evenodd"${t} fill="${ref(p, "band")}"/>`, [cx - hx, cy - hy, cx + hx, cy + hy], true, { ball: [cx, cy, Math.max(rx, ry)] });
  };
  const arc = (cx, cy, r, w, from, to, p) => {
    num("arc", cx, cy, r, w, from, to);
    if (w <= 0 || w >= 2 * r) throw new Error("lumen: an arc's width lies between 0 and its diameter");
    if (to < from) [from, to] = [to, from];
    if (to - from > 360) throw new Error("lumen: an arc covers at most 360 degrees");
    const h = w / 2, a0 = (from * Math.PI) / 180, a1 = (to * Math.PI) / 180, n = Math.max(8, Math.ceil((to - from) / 8));
    const at = (rr, a) => [cx + rr * Math.cos(a), cy + rr * Math.sin(a)];
    const cap = (a, sign) => {
      const [ux, uy] = [Math.cos(a), Math.sin(a)], [vx, vy] = [-Math.sin(a), Math.cos(a)], [mx, my] = at(r, a);
      return Array.from({ length: 5 }, (_, k) => {
        const t = (Math.PI * (k + 1)) / 6;
        return [mx + h * sign * (ux * Math.cos(t) + vx * Math.sin(t)), my + h * sign * (uy * Math.cos(t) + vy * Math.sin(t))];
      });
    };
    const outer = [], inner = [];
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      outer.push(at(r + h, a));
      inner.push(at(r - h, a));
    }
    const points = [...outer, ...cap(a1, 1), ...inner.reverse(), ...cap(a0, -1)];
    return put("mass", `<polygon points="${pts(points)}" fill="${ref(p, "arc")}"/>`, boxOf(points), true, { ball: [cx, cy, r + h] });
  };
  const beam = (x1, y1, x2, y2, w1, w2, p) => {
    num("beam", x1, y1, x2, y2, w1, w2);
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    if (!len || w1 <= 0 || w2 <= 0) throw new Error("lumen: a beam has a length and two widths above 0");
    const nx = (-dy / len) / 2, ny = (dx / len) / 2;
    const four = [[x1 + nx * w1, y1 + ny * w1], [x2 + nx * w2, y2 + ny * w2], [x2 - nx * w2, y2 - ny * w2], [x1 - nx * w1, y1 - ny * w1]];
    const along = p && p.type === "fade" ? { ...p, angle: (Math.atan2(dy, dx) * 180) / Math.PI } : p;
    return put("mass", `<polygon points="${pts(four)}" fill="${ref(along, "beam", false)}"/>`, boxOf(four));
  };

  // lines: a taste, off by default (style.mjs). When they are off, each says how to turn them on.
  const needLines = (what) => {
    if (!STYLE.lines.allowed) throw new Error(`lumen: lines are off in style.mjs (lines.allowed), so no ${what}. Turn them on there if you want them, or say it with a mass: band(), arc() or beam(), a pale hollow mass for a ghost (rule 05)`);
  };
  const extra = (o = {}) => {
    let s = "";
    if (o.dash) s += ` stroke-dasharray="${STYLE.lines.dash}"`;
    if (o.soft) s += ` stroke-opacity="${STYLE.lines.softOpacity}"`;
    if (o.paper) s += ` stroke="${PAPER}"`;
    return s;
  };
  const line = (points, o) => {
    needLines("line");
    list("line", points, 2);
    return put("line", `<polyline points="${pts(points)}"${extra(o)}/>`, boxOf(points));
  };
  const arrow = (x1, y1, x2, y2, o) => {
    needLines("arrow");
    if (!STYLE.lines.arrows) throw new Error("lumen: arrows are off in style.mjs (lines.arrows). Turn them on there, or use a plain line()");
    num("arrow", x1, y1, x2, y2);
    const a = Math.atan2(y2 - y1, x2 - x1), len = 8, spread = 0.5;
    const p = (da) => `${f(x2 - len * Math.cos(a + da))} ${f(y2 - len * Math.sin(a + da))}`;
    return put("line", `<path d="M${f(x1)} ${f(y1)}L${f(x2)} ${f(y2)}M${p(spread)}L${f(x2)} ${f(y2)}L${p(-spread)}"${extra(o)}/>`, boxOf([[x1, y1], [x2, y2]]));
  };
  const orbit = (cx, cy, rx, ry, o = {}) => {
    needLines("orbit");
    num("orbit", cx, cy, rx, ry);
    const rot = o.rot ?? 0;
    const [hx, hy] = reach(rx, ry, rot);
    const t = rot ? ` transform="rotate(${f(rot)} ${f(cx)} ${f(cy)})"` : "";
    if (o.arc) {
      const [a0, a1] = o.arc.map((d) => (d * Math.PI) / 180);
      const at = (a) => `${f(cx + rx * Math.cos(a))} ${f(cy + ry * Math.sin(a))}`;
      const large = (((o.arc[1] - o.arc[0]) % 360) + 360) % 360 > 180 ? 1 : 0;
      return put("line", `<path d="M${at(a0)}A${f(rx)} ${f(ry)} 0 ${large} 1 ${at(a1)}"${t}${extra(o)}/>`, [cx - hx, cy - hy, cx + hx, cy + hy], true, { ball: [cx, cy, Math.max(rx, ry)] });
    }
    return put("line", `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}"${t}${extra(o)}/>`, [cx - hx, cy - hy, cx + hx, cy + hy], true, { ball: [cx, cy, Math.max(rx, ry)] });
  };
  const frame = (x, y, w, h, o = {}) => {
    needLines("outline");
    num("frame", x, y, w, h);
    const rr = o.radius ? ` rx="${f(o.radius)}"` : "";
    return put("line", `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}"${rr}${extra(o)}/>`, [x, y, x + w, y + h]);
  };
  const hull = (points, o) => {
    needLines("outline");
    list("hull", points, 3);
    return put("line", `<polygon points="${pts(points)}"${extra(o)}/>`, boxOf(points));
  };
  const axes = (x0, y0, x1, y1, o) => {
    needLines("axis");
    num("axes", x0, y0, x1, y1);
    return line([[x0, y0], [x0, y1], [x1, y1]], o);
  };

  // a mark: one small filled glyph, or a stroked one when lines are on
  const glyph = (kind, cx, cy, s, o = {}) => {
    num("glyph", cx, cy, s);
    if (!GLYPHS.includes(kind)) throw new Error(`lumen: unknown glyph "${kind}". The glyphs are ${GLYPHS.join(", ")}`);
    stats.glyphs++;
    const k = o.paper ? PAPER : INK;
    const h = s / 2;
    const box4 = [cx - h, cy - h, cx + h, cy + h];
    const ex = o.paper ? ` stroke="${PAPER}"` : "";
    if (kind === "play") return put("mark", `<polygon points="${pts([[cx - 0.35 * s, cy - h], [cx + 0.55 * s, cy], [cx - 0.35 * s, cy + h]])}" fill="${k}"/>`, box4, false);
    if (kind === "star") {
      const p = Array.from({ length: 10 }, (_, i) => {
        const a = -Math.PI / 2 + (i * Math.PI) / 5, r = i % 2 ? h * 0.42 : h;
        return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
      });
      return put("mark", `<polygon points="${pts(p)}" fill="${k}"/>`, box4, false);
    }
    if (kind === "dots") {
      const r = s * 0.1;
      return put("mark", [-1, 0, 1].map((i) => `<circle cx="${f(cx + i * s * 0.4)}" cy="${f(cy)}" r="${f(r)}" fill="${k}"/>`).join(""), box4, false);
    }
    if (kind === "plus") return put("line", `<path d="M${f(cx - h)} ${f(cy)}H${f(cx + h)}M${f(cx)} ${f(cy - h)}V${f(cy + h)}"${ex}/>`, box4, false);
    if (kind === "check") return put("line", `<polyline points="${pts([[cx - h, cy], [cx - 0.2 * s, cy + 0.35 * s], [cx + h, cy - 0.4 * s]])}"${ex}/>`, box4, false);
    const r = s * 0.17;
    return put("line", `<path d="${circlePath(cx - h + r, cy - h + r, r)}${circlePath(cx + h - r, cy + h - r, r)}M${f(cx + h)} ${f(cy - h)}L${f(cx - h)} ${f(cy + h)}"${ex}/>`, box4, false);
  };

  const rot = (points, deg, cx, cy) => {
    list("rot", points, 1);
    const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    return points.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]);
  };
  /** A seeded generator (mulberry32): the same seed gives the same numbers, so a piece still draws the same every run. */
  const rand = (seed = 1) => {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // motion
  const moves = [];
  const centre = (b) => [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
  const scaled = (b, k, ox, oy) => [ox + (b[0] - ox) * k, oy + (b[1] - oy) * k, ox + (b[2] - ox) * k, oy + (b[3] - oy) * k];
  const per = (v, i, d) => (Array.isArray(v) ? (v[i] ?? d) : (v ?? d));
  const loop = () => {
    throw new Error("lumen: loop() is gone. A move runs on a loop with the option move(h, kind, { loop: seconds }), and only when style.motion.loops is true");
  };
  const move = (targets, kind, o = {}) => {
    if (!MOVES.includes(kind)) throw new Error(`lumen: unknown move "${kind}". The moves are ${MOVES.join(", ")}`);
    const ids = [targets].flat(2);
    if (!ids.length) throw new Error("lumen: move() needs a part to move");
    if (o.loop && !STYLE.motion.loops) throw new Error("lumen: loops are off in style.mjs (motion.loops). Turn them on there to run a move on a loop, or leave it to answer the hover");
    if (!o.loop && !STYLE.motion.hover) throw new Error("lumen: the hover is off in style.mjs (motion.hover), so a move needs { loop: seconds }");
    ids.forEach((h, i) => {
      const n = nodes[h];
      if (!n) throw new Error("lumen: move() was given something that is not a drawn part. Give it what a mass, a line or a mark returned");
      if (n.move) throw new Error("lumen: a part moves once. Give each part one move");
      const looping = o.loop ? (o.loop === true ? 6 : o.loop) : 0;
      const m = { kind, fade: per(o.fade, i, 1), delay: per(o.delay, i, 0) + (o.step ?? 0) * i, dur: per(o.dur, i, TIMING.enter), loop: looping };
      num("move", m.fade, m.delay, m.dur, m.loop);
      if (m.fade < 0 || m.fade > 1) throw new Error("lumen: fade is the opacity a part goes to, between 0 and 1");
      if (m.delay < 0) throw new Error("lumen: a delay is not negative");
      if (looping) {
        if (looping < 2 || looping > 12) warn("pace", `a loop of ${looping}s is outside 2 to 12s: it reads as a flicker or as standing still (rule 13)`);
        if (m.delay >= looping) warn("pace", "a delay as long as the loop it belongs to starts the part a whole cycle late (rule 13)");
      } else {
        if (m.dur < TIMING.min || m.dur > TIMING.max) warn("pace", `a move of ${f(m.dur)}s is outside ${TIMING.min} to ${TIMING.max}s: it snaps or drags (rule 13)`);
        if (m.delay + m.dur > TIMING.total) warn("pace", `the gesture lasts ${f(m.delay + m.dur)}s, past ${TIMING.total}s: it reads as a queue, not as one gesture (rule 13)`);
      }
      let sw = n.box;
      if (kind === "spin") {
        m.by = per(o.by, i, 90);
        num("spin", m.by);
        if (!m.by) throw new Error("lumen: spin needs an angle (by), other than 0");
        if (Math.abs(m.by) > REACH.turn) warn("reach", `spin turns by ${m.by} degrees, past ${REACH.turn} (rule 14)`);
        m.cx = per(o.cx, i, SIZE / 2);
        m.cy = per(o.cy, i, SIZE / 2);
        num("spin", m.cx, m.cy);
        const R = n.ball ? Math.hypot(m.cx - n.ball[0], m.cy - n.ball[1]) + n.ball[2] : Math.max(...[[n.box[0], n.box[1]], [n.box[2], n.box[1]], [n.box[0], n.box[3]], [n.box[2], n.box[3]]].map(([x, y]) => Math.hypot(x - m.cx, y - m.cy)));
        sw = [m.cx - R, m.cy - R, m.cx + R, m.cy + R];
      } else if (kind === "swell") {
        m.to = per(o.to, i, 1.1);
        num("swell", m.to);
        if (m.to <= 0) throw new Error("lumen: swell goes to a size above 0");
        if (m.to === 1) warn("reach", "swell to 1 does nothing");
        else if (m.to < REACH.scaleMin || m.to > REACH.scaleMax) warn("reach", `swell goes to ${m.to}, outside ${REACH.scaleMin} to ${REACH.scaleMax}: the part comes apart from its neighbours (rule 14)`);
        if (n.kind === "line") warn("weight", "a line that swells changes its weight; drift or spin keep it (rule 05)");
        const [bx, by] = centre(n.box);
        m.cx = per(o.cx, i, bx);
        m.cy = per(o.cy, i, by);
        num("swell", m.cx, m.cy);
        sw = grow(n.box, scaled(n.box, m.to, m.cx, m.cy));
      } else {
        m.dx = per(o.dx, i, 0);
        m.dy = per(o.dy, i, 0);
        num("drift", m.dx, m.dy);
        if (!m.dx && !m.dy) throw new Error("lumen: drift needs a dx or a dy");
        if (Math.abs(m.dx) > REACH.shift || Math.abs(m.dy) > REACH.shift) warn("reach", `drift goes ${f(m.dx)}, ${f(m.dy)}, past ${REACH.shift} units: the part leaves its neighbours behind (rule 14)`);
        sw = grow(n.box, [n.box[0] + m.dx, n.box[1] + m.dy, n.box[2] + m.dx, n.box[3] + m.dy]);
      }
      n.move = m;
      n.swept = sw;
    });
    moves.push({ kind, targets: ids.length, loop: o.loop ? (o.loop === true ? 6 : o.loop) : 0 });
  };

  const settle = (t) => 1 - (1 - t) ** 3; // the shape of the css easing, for the frozen frames
  const pose = (m, p) => {
    const t = m.kind === "drift" ? `translate(${f(m.dx * p)}px,${f(m.dy * p)}px)` : m.kind === "swell" ? `scale(${f(1 + (m.to - 1) * p)})` : `rotate(${f(m.by * p)}deg)`;
    return `transform:${t}${m.fade !== 1 ? `;opacity:${f(1 + (m.fade - 1) * p)}` : ""}`;
  };
  /**
   * The css of the piece's motion. A hover move is a transition between two poses: the hover pose is set by
   * the trigger, and the rest pose is what the part goes back to. A loop move is a keyframe animation that
   * starts and ends at rest. With `hover` (0 to 1) every part is frozen that far through its gesture (or
   * its cycle), to take a picture.
   */
  const motionCss = (uid, hover) => {
    const hovering = nodes.filter((n) => n.move && !n.move.loop);
    const total = Math.max(0, ...hovering.map((n) => n.move.delay + n.move.dur));
    const on = `:is(svg.lm-${uid}:is(:hover,.lm-on),.lm-host:is(:hover,:focus-visible,:focus-within) svg.lm-${uid})`;
    const rules = [];
    const frames = new Map();
    nodes.forEach((n, idx) => {
      const m = n.move;
      if (!m) return;
      const cls = `.lm-${uid}-${idx}`;
      const pivot = m.cx === undefined ? "" : `transform-box:view-box;transform-origin:${f(m.cx)}px ${f(m.cy)}px;`;
      if (m.loop) {
        if (hover !== undefined) {
          const p = m.kind === "spin" ? hover : settle(hover < 0.5 ? 2 * hover : 2 - 2 * hover);
          rules.push(`${cls}{${pivot}${m.kind === "spin" ? `transform:rotate(${f(360 * Math.sign(m.by) * p)}deg)` : pose(m, p)}}`);
          return;
        }
        const body = m.kind === "spin" ? `from{transform:rotate(0deg)}to{transform:rotate(${360 * Math.sign(m.by)}deg)}` : `0%,100%{${pose(m, 0)}}50%{${pose(m, 1)}}`;
        const key = hash(body);
        frames.set(key, `@keyframes lm-k${key}{${body}}`);
        rules.push(`${cls}{${pivot}animation:lm-k${key} ${f(m.loop)}s ${m.kind === "spin" ? "linear" : LOOP_EASE} ${f(m.delay)}s infinite}`);
        return;
      }
      if (hover !== undefined) {
        rules.push(`${cls}{${pivot}${pose(m, settle(Math.min(1, Math.max(0, (hover * total - m.delay) / m.dur))))}}`);
        return;
      }
      const tr = (secs) => ["transform", ...(m.fade !== 1 ? ["opacity"] : [])].map((p) => `${p} ${f(secs)}s ${EASE}`).join(",");
      rules.push(`${cls}{${pivot}transition:${tr(TIMING.leave)}}`);
      rules.push(`${on} ${cls}{${pose(m, 1)};transition:${tr(m.dur)};transition-delay:${f(m.delay)}s}`);
    });
    if (!rules.length) return "";
    const css = rules.join("") + [...frames.values()].join("");
    return hover !== undefined ? `<style>${css}</style>` : `<style>@media (prefers-reduced-motion:no-preference){${css}}</style>`;
  };

  /** The page of the piece: its motion, the defs it uses, then its masses, lines and marks in the order they were called. */
  function svg({ name = "lumen", means = "", grain = true, paper = false, animate = false, hover } = {}) {
    const grained = grain && STYLE.grain.on;
    const hasMass = nodes.some((n) => n.kind === "mass");
    const defs = [...grads.values()].map((g) => g.tag).join("") + (grained && hasMass ? GRAIN : "");
    const uid = hash(nodes.map((n) => n.svg).join("") + JSON.stringify(nodes.map((n) => n.move)));
    const stroke = `fill="none" stroke="${LINE}" stroke-width="${STYLE.lines.weight}" stroke-opacity="${STYLE.lines.opacity}" stroke-linecap="round" stroke-linejoin="round"`;
    const group = (kind, inner) => (kind === "mass" ? `<g${grained ? ' filter="url(#lm-grain)"' : ""}>${inner}</g>` : kind === "line" ? `<g ${stroke}>${inner}</g>` : `<g>${inner}</g>`);
    const moving = (n) => animate && n.move;
    let body = "";
    for (let i = 0; i < nodes.length; ) {
      const n = nodes[i];
      if (moving(n)) {
        body += `<g class="lm-${uid}-${i}">${group(n.kind, n.svg)}</g>`;
        i++;
        continue;
      }
      let j = i;
      while (j < nodes.length && nodes[j].kind === n.kind && !moving(nodes[j])) j++;
      body += group(n.kind, nodes.slice(i, j).map((x) => x.svg).join(""));
      i = j;
    }
    const css = animate ? motionCss(uid, hover) : "";
    const root = css ? ` class="lm-${uid}"` : "";
    const bg = paper ? `<rect width="${SIZE}" height="${SIZE}" fill="${PAPER}"/>` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg"${root} viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}" role="img"><title>${esc(name)}</title><desc>${esc(means)}</desc>${css}<defs>${defs}</defs>${bg}${body}</svg>\n`;
  }

  const measure = () => {
    let sm = null, sa = null, moving = 0, gesture = 0, loops = 0;
    for (const n of nodes) {
      const b = n.swept ?? n.box;
      sa = grow(sa, b);
      if (n.kind === "mass") sm = grow(sm, b);
      if (n.move) {
        moving++;
        if (n.move.loop) loops++;
        else gesture = Math.max(gesture, n.move.delay + n.move.dur);
      }
    }
    return { ...stats, mass, all, sweptMass: sm, sweptAll: sa, motions: moves.length, moving, gesture, loops, hovers: moving - loops, moves: moves.slice(), warnings: warnings.slice() };
  };
  return { fade, glow, disc, oval, ring, rect, poly, curve, box, cyl, band, arc, beam, line, arrow, orbit, frame, hull, axes, glyph, rot, rand, loop, move, svg, measure };
}
