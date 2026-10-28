#!/usr/bin/env node
/**
 * A picture of the hover: one row per piece, one column per step from rest to hover.
 *
 *   node strip.mjs <a.js> [b.js ...] [--frames 5] [--size 120] [--out lumen-strip]
 *
 * Each frame is the piece frozen by the kit part of the way through its hover
 * gesture (rest first, the full hover pose last), so a png can show what a hover
 * does, staggers included (a png cannot play it). Pieces that do not move are
 * skipped. It writes <out>.png. Use it to judge a set's motion side by side and to
 * show a hover in a place that cannot play one.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { draw } from "./build.mjs";
import { LINE, PAPER } from "./kit.mjs";
import { shot } from "./chrome.mjs";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { frames: { type: "string", default: "5" }, size: { type: "string", default: "120" }, out: { type: "string", default: "lumen-strip" } },
});
if (!positionals.length) {
  console.error("usage: node strip.mjs <a.js> [b.js ...] [--frames 5] [--size 120] [--out lumen-strip]");
  process.exit(2);
}
const N = Math.max(2, +values.frames);
const size = +values.size;
const uri = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

const rows = [];
for (const file of positionals) {
  const source = readFileSync(file, "utf8");
  const still = draw(source, { grain: true });
  if (!still.stats.motions) { console.error(`${file}: does not move, skipped`); continue; }
  const cycle = still.stats.hovers === 0; // all loops: the frames are phases of a cycle, not steps to a hover pose
  const label = (k) => (cycle ? `${Math.round((100 * k) / (N - 1))}%` : k === 0 ? "rest" : k === N - 1 ? "hover" : `${Math.round((100 * k) / (N - 1))}%`);
  rows.push({ name: still.spec.name, g: still.stats.gesture, cycle, frames: Array.from({ length: N }, (_, k) => ({ t: label(k), src: uri(draw(source, { grain: true, animate: true, hover: k / (N - 1) }).svg) })) });
}
if (!rows.length) process.exit(0);

const labelW = 150, cell = size + 14, pad = 24, rowH = size + 34;
const W = pad * 2 + labelW + N * cell;
const H = pad * 2 + rows.length * rowH;
const html = `<!doctype html><meta charset="utf-8"><style>
html,body{margin:0;background:${PAPER};font:500 11px/1 "Helvetica Neue",Helvetica,Arial,sans-serif;color:${LINE}}
.g{padding:${pad}px;display:grid;grid-template-columns:${labelW}px repeat(${N},${cell}px);grid-auto-rows:${rowH}px;align-items:start}
.n{align-self:center;letter-spacing:.07em;text-transform:uppercase;font-size:12px}.n i{display:block;margin-top:6px;font-style:normal;opacity:.6;letter-spacing:.03em;text-transform:none;font-size:10px}
.f{text-align:center}.f img{display:block;width:${size}px;height:${size}px;margin:0 auto}.f span{display:block;margin-top:4px;font-size:9px;opacity:.55}
</style><div class="g">${rows.map((r) => `<div class="n">${r.name}<i>${r.cycle ? "one cycle of its loop" : `${r.g.toFixed(1)}s on hover`}</i></div>${r.frames.map((f) => `<div class="f"><img src="${f.src}" alt=""><span>${f.t}</span></div>`).join("")}`).join("")}</div>`;

const page = join(tmpdir(), `lumen-strip-${process.pid}.html`);
writeFileSync(page, html);
const png = resolve(`${values.out}.png`);
try {
  if (!shot(page, png, { w: W, h: H, scale: 2 })) throw new Error("no picture");
  console.log(png);
} catch (e) {
  console.error(e.message === "no-browser" ? "No browser found (set LUMEN_CHROME): the strip could not be taken." : `Could not take the picture: ${e.message}`);
  process.exit(2);
}
