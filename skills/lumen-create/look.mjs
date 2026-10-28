#!/usr/bin/env node
/**
 * The look in one command, run from the person's working directory:
 *
 *   node <skill folder>/look.mjs <piece.js> [--source <file>] [--zoom] [--png]
 *
 * It draws the piece and validates it as build.mjs and validate.mjs do, writes
 * lumen-<name>.svg, measures the ink on two pictures of the piece (with its
 * grain, and without), then takes one sheet: lumen-<name>-look.png. The sheet
 * holds the piece at 360px with its grain and without; its frame, with the
 * margins and the box the ink really covers; at 160, 64 and 32px; on white; as
 * a value study (grey, no hue); and as it sits in a set, with its name.
 * It prints one line each for items 9 frame, 3 fade, 2 core, 7 grain and 8 ink
 * of look.md, and for a piece that moves, 14 reach and 15 verb, measured on five frozen
 * frames of the hover gesture, rest to hover (the sheet shows them as a strip; the html
 * holds the piece live: hover it), and exits 1 when the validator rejects the piece or the frame or
 * the ink would be cut, 2 when there is no browser, and 0 otherwise. Warnings never stop it. Everything else
 * is for eyes, on the sheet.
 *
 *   --source <file>  an svg, png, jpg or webp the piece was made from: it joins the sheet beside the first pictures
 *   --zoom           also writes lumen-<name>-zoom.png: the piece at 1200px, for the grain and the soft edges
 *   --png            also writes lumen-<name>.png: the piece at 1024px on a transparent ground
 */
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { draw } from "./build.mjs";
import { INK, LINE, PAPER, SIZE, STYLE } from "./kit.mjs";
import { shot } from "./chrome.mjs";
import { decodePng } from "./png.mjs";
import { blocking, validate } from "./validate.mjs";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { source: { type: "string" }, zoom: { type: "boolean", default: false }, png: { type: "boolean", default: false }, strict: { type: "boolean", default: false } },
});
if (!positionals[0]) {
  console.error("usage: node look.mjs <piece.js> [--source <file>] [--zoom] [--png] [--strict]");
  process.exit(2);
}

const MIME = { ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif" };
const uri = (text, mime = "image/svg+xml") => `data:${mime};base64,${Buffer.from(text).toString("base64")}`;
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const pct = (v) => `${Math.round(v * 100)}%`;
const E = STYLE.limits.edge;

const source = readFileSync(positionals[0], "utf8");
const found = validate(source);
for (const f of found) console.log(`${f.level.padEnd(5)} ${f.check.padEnd(8)} ${f.msg}`);
if (blocking(found, values.strict).length) {
  console.log("The validator stopped the piece. Fix the errors, then run the look again (warnings are yours to judge).");
  process.exit(1);
}
const grained = draw(source, { grain: true });
const bare = draw(source, { grain: false });
const live = draw(source, { grain: true, animate: true });
const name = grained.spec.name;
const moves = grained.stats.motions > 0;
const svgFile = resolve(`lumen-${name}.svg`);
writeFileSync(svgFile, live.svg);
if (moves) writeFileSync(resolve(`lumen-${name}-still.svg`), grained.svg);
const FRAMES = 5;
const frameLabels = grained.stats.hovers === 0 ? ["0%", "25%", "50%", "75%", "100%"] : ["rest", "25%", "50%", "75%", "hover"];
const frameSvgs = moves ? Array.from({ length: FRAMES }, (_, k) => uri(draw(source, { grain: true, animate: true, hover: k / (FRAMES - 1) }).svg)) : [];

const G = uri(grained.svg);
const B = uri(bare.svg);
let src = null;
if (values.source) src = `data:${MIME[extname(values.source).toLowerCase()] ?? "image/png"};base64,${readFileSync(values.source).toString("base64")}`;

/** The piece alone at `px` on a transparent ground, as a picture file: what the measuring reads. */
function plain(img, px, tag, opts = {}) {
  const page = join(tmpdir(), `lumen-${name}-${tag}.html`);
  const out = join(tmpdir(), `lumen-${name}-${tag}.png`);
  writeFileSync(page, `<!doctype html><body style="margin:0;background:${opts.paper ? PAPER : "transparent"}"><img src="${img}" style="width:${px}px;height:${px}px;display:block">`);
  if (!shot(page, out, { w: px, h: px, transparent: !opts.paper })) throw new Error("no picture");
  return out;
}

/** What the ink is, read from the two pictures. */
function measure(gPng, bPng) {
  const g = decodePng(readFileSync(gPng)), b = decodePng(readFileSync(bPng));
  const N = g.w, U = N / SIZE;
  const pal = [INK, LINE, PAPER].map(rgb);
  const near = (i, c) => Math.hypot(g.data[i] - c[0], g.data[i + 1] - c[1], g.data[i + 2] - c[2]) < 45;
  let ink = 0, soft = 0, dense = 0, solid = 0, onPalette = 0, rg = 0, rb = 0, rn = 0, x0 = N, y0 = N, x1 = -1, y1 = -1;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const i = (y * N + x) * 4, a = g.data[i + 3], ba = b.data[i + 3];
      if (a > 8) {
        ink++;
        if (a < 215) soft++;
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
      if (ba > 200) dense++;
      if (a > 240) { solid++; if (pal.some((c) => near(i, c))) onPalette++; }
      if (ba > 40 && ba < 200 && x < N - 1) { rg += Math.abs(a - g.data[i + 7]); rb += Math.abs(ba - b.data[i + 7]); rn++; }
    }
  }
  return {
    ink: ink / (N * N), soft: ink ? soft / ink : 0, dense: ink ? dense / ink : 0,
    box: [x0 / U, y0 / U, (x1 + 1) / U, (y1 + 1) / U],
    onPalette: solid ? onPalette / solid : 1,
    grain: rn ? rg / rn / Math.max(rb / rn, 0.5) : 0, rn,
  };
}

let m = null;
let code = 0;
try {
  m = measure(plain(G, 400, "g"), plain(B, 400, "b"));
} catch (e) {
  if (e.message === "no-browser") {
    console.error(`No browser found, so nothing was measured or looked at. The svg is ${svgFile}; set LUMEN_CHROME to a Chrome, or open it yourself. Then do the look as look.md says under "Without a browser".`);
    process.exit(2);
  }
  console.error(`Could not measure the piece: ${e.message}`);
  code = 2;
}

if (m) {
  const [a, b, c, d] = m.box.map((v) => Math.round(v));
  const line = (state, item, label, text) => console.log(`${String(item).padStart(2)} ${label.padEnd(6)} ${state.padEnd(5)} ${text}`);
  const fail = (...r) => { line("FAIL", ...r); code = 1; };
  if (m.ink === 0) fail(9, "frame", "nothing is drawn: the picture is blank.");
  else if (a < 1 || b < 1 || c > SIZE - 1 || d > SIZE - 1) fail(9, "frame", `the ink's box is ${a},${b} to ${c},${d}: it reaches the edge of the ${SIZE} frame and would be cut.`);
  else if (a < E || b < E || c > SIZE - E || d > SIZE - E) line("warn", 9, "frame", `ink box ${a},${b} to ${c},${d}: within ${E} units of the edge.`);
  else line("ok", 9, "frame", `ink box ${a},${b} to ${c},${d}; the ink covers ${pct(m.ink)} of the frame${m.ink < 0.08 ? " (small: a thumbnail will lose it)" : ""}.`);
  if (m.ink) {
    if (m.soft < 0.3) line("warn", 3, "fade", `only ${pct(m.soft)} of the ink is in a fade; the piece may read flat (rule 02).`);
    else line("ok", 3, "fade", `${pct(m.soft)} of the ink is in a fade.`);
    if (m.dense < 0.01) line("warn", 2, "core", `only ${pct(m.dense)} of the ink is dense (deep or core): there may be no core to start the eye (rule 04).`);
    else if (m.dense > 0.55) line("warn", 2, "core", `${pct(m.dense)} of the ink is dense (deep or core): the piece is heavy, and its core may not stand out (rule 04).`);
    else line("ok", 2, "core", `${pct(m.dense)} of the ink is dense (deep or core).`);
    if (!m.rn) line("warn", 7, "grain", "no soft area to measure: the grain cannot show.");
    else if (m.grain < 1.3) line("warn", 7, "grain", `the grain is barely above the bare gradient (x${m.grain.toFixed(1)}).`);
    else line("ok", 7, "grain", `the grain roughens the soft areas x${m.grain.toFixed(1)} over the bare gradient.`);
    if (m.onPalette < 0.9) line("warn", 8, "ink", `only ${pct(m.onPalette)} of the solid pixels are the ink, the line or the paper.`);
    else line("ok", 8, "ink", `${pct(m.onPalette)} of the solid pixels are palette.`);
  }
}

/** Five frozen frames of the hover gesture on one transparent page, read back and cropped: where the ink goes and how much of it moves. */
function measureMotion(restPng) {
  const rest = decodePng(readFileSync(restPng));
  const page = join(tmpdir(), `lumen-${name}-frames.html`);
  const out = join(tmpdir(), `lumen-${name}-frames.png`);
  writeFileSync(page, `<!doctype html><body style="margin:0;background:transparent">${frameSvgs.map((u, k) => `<img src="${u}" style="position:absolute;left:${k * 200}px;top:0;width:200px;height:200px">`).join("")}`);
  if (!shot(page, out, { w: FRAMES * 200, h: 200, scale: 2, transparent: true })) throw new Error("no picture");
  const png = decodePng(readFileSync(out));
  const N = rest.w, U = N / SIZE;
  let inkRest = 0;
  for (let i = 3; i < rest.data.length; i += 4) if (rest.data[i] > 8) inkRest++;
  let widest = [N, N, 0, 0], most = 0, mostAt = 0;
  for (let k = 0; k < FRAMES; k++) {
    const ox = k * N, oy = 0;
    let changed = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const a = png.data[((oy + y) * png.w + ox + x) * 4 + 3], r = rest.data[(y * N + x) * 4 + 3];
      if (a > 8) { if (x < widest[0]) widest[0] = x; if (y < widest[1]) widest[1] = y; if (x > widest[2]) widest[2] = x; if (y > widest[3]) widest[3] = y; }
      if (Math.abs(a - r) > 40) changed++;
    }
    if (changed > most) { most = changed; mostAt = k; }
  }
  return { box: [widest[0] / U, widest[1] / U, (widest[2] + 1) / U, (widest[3] + 1) / U], moved: inkRest ? most / inkRest : 0, at: frameLabels[mostAt] };
}
let mo = null;
if (m && moves) {
  try { mo = measureMotion(plain(G, 400, "g")); } catch (e) { console.error(`Could not measure the motion: ${e.message}`); code = code || 2; }
}
if (mo) {
  const [a, b, c, d] = mo.box.map((v) => Math.round(v));
  const st = grained.stats;
  const line = (state, item, label, text) => console.log(`${String(item).padStart(2)} ${label.padEnd(6)} ${state.padEnd(5)} ${text}`);
  if (a < 1 || b < 1 || c > SIZE - 1 || d > SIZE - 1) { line("FAIL", 14, "reach", `on hover the ink goes out to ${a},${b} to ${c},${d} and would be cut. Shorten the move or draw smaller.`); code = 1; }
  else if (a < E || b < E || c > SIZE - E || d > SIZE - E) line("warn", 14, "reach", `on hover the ink comes within ${E} units of the edge: ${a},${b} to ${c},${d}.`);
  else line("ok", 14, "reach", `on hover the ink stays inside ${a},${b} to ${c},${d}.`);
  if (mo.moved < 0.04) line("warn", 15, "verb", `${st.motions} move(s) on ${st.moving} part(s), but at most ${pct(mo.moved)} of the ink moves: it barely moves, the hover will not read.`);
  else if (mo.moved > 1.5) line("warn", 15, "verb", `${st.motions} move(s) on ${st.moving} part(s), and ${pct(mo.moved)} of the ink moves: everything moves, so the rest pose is lost.`);
  else line("ok", 15, "verb", `${st.motions} move(s) on ${st.moving} part(s), ${st.hovers === 0 ? "all on a loop" : `a ${st.gesture.toFixed(1)}s gesture`}; ${st.hovers === 0 ? "over a cycle" : "on hover"} at most ${pct(mo.moved)} of the ink has moved (at ${mo.at}).`);
}

const BIG = 360;
const panel = (label, size, extra = "", bg = PAPER, img = G, frame = "") =>
  `<figure style="background:${bg}"><div class="p" style="width:${size}px;height:${size}px"><img src="${img}" style="width:${size}px;height:${size}px;${extra}" alt="">${frame}</div><figcaption>${label}</figcaption></figure>`;
const k = BIG / SIZE;
const inkBox = m && m.ink ? `<i class="b" style="left:${m.box[0] * k}px;top:${m.box[1] * k}px;width:${(m.box[2] - m.box[0]) * k}px;height:${(m.box[3] - m.box[1]) * k}px"></i>` : "";
const html = `<!doctype html><meta charset="utf-8"><title>lumen look</title>
<style>
html,body{margin:0;background:#fff;font:11px/1.3 "Helvetica Neue",Helvetica,Arial,sans-serif;color:#555}
.w{width:1380px;padding:20px;box-sizing:border-box}
.r{display:flex;flex-wrap:wrap;gap:16px;margin-bottom:16px;align-items:flex-start}
figure{margin:0;padding:12px;box-sizing:border-box;border:1px solid #e3e3ee}
figcaption{margin-top:8px;font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:#777}
.p{position:relative}.p img,.p svg{display:block}
.p i{position:absolute;display:block}
.p .m{inset:10%;border:1px dashed #e0457b}
.p .x{left:50%;top:0;bottom:0;border-left:1px dotted #e0457b;opacity:.5}
.p .b{border:1px solid #1aa97c}
.s{display:flex;flex-direction:column;align-items:center;gap:8px}
.s b{font-weight:500;font-size:12px;letter-spacing:.07em;text-transform:uppercase;color:${LINE}}
</style>
<div class="w">
<div class="r">
${panel("rest . 360px, grain", BIG)}
${panel("bare . 360px, no grain", BIG, "", PAPER, B)}
${panel("frame . margins (pink), ink's box (green)", BIG, "", PAPER, G, `<i class="m"></i><i class="x"></i>${inkBox}`)}
${src ? panel("source", BIG, "object-fit:contain;", PAPER, src) : ""}
</div>
<div class="r">
${panel("160px", 160)}
${panel("64px", 64)}
${panel("32px", 32)}
${panel("on white . 160px", 160, "", "#fff")}
${panel("value study . 160px", 160, "filter:grayscale(1);")}
<figure style="background:${PAPER}"><div class="s" style="width:200px"><img src="${G}" style="width:200px;height:200px" alt=""><b>${name}</b></div><figcaption>in a set</figcaption></figure>
</div>
${moves ? `<div class="r"><figure class="lm-host" style="background:${PAPER}"><div class="p" style="width:200px;height:200px">${live.svg.trim()}</div><figcaption>live . ${grained.stats.hovers === 0 ? "it loops" : "hover it"}</figcaption></figure>${frameSvgs.map((u, k) => panel(frameLabels[k], 120, "", PAPER, u)).join("")}</div>` : ""}
</div>`;

const htmlFile = resolve(`lumen-${name}-look.html`);
const pngFile = resolve(`lumen-${name}-look.png`);
writeFileSync(htmlFile, html);
try {
  if (shot(htmlFile, pngFile, { w: 1380, h: (src ? 1180 : 780) + (moves ? 260 : 0), scale: 2 })) console.log(pngFile);
  if (values.zoom) {
    const z = join(tmpdir(), `lumen-${name}-zoom.html`);
    writeFileSync(z, `<!doctype html><body style="margin:0;background:${PAPER}"><img src="${G}" style="width:1200px;height:1200px;display:block">`);
    const out = resolve(`lumen-${name}-zoom.png`);
    if (shot(z, out, { w: 1200, h: 1200 })) console.log(out);
  }
  if (values.png) {
    const out = resolve(`lumen-${name}.png`);
    const p = plain(G, 1024, "png");
    writeFileSync(out, readFileSync(p));
    console.log(out);
  }
} catch (e) {
  console.error(`Could not take the picture: ${e.message}`);
  code = code || 2;
}
console.log(svgFile);
process.exit(code);
