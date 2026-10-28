#!/usr/bin/env node
/**
 * Lays pieces out as a set, the way a set is shown: pale paper, a grid, each
 * piece with its name in small capitals under it.
 *
 *   node sheet.mjs <a.svg> [b.svg ...] [--cols 3] [--size 200] [--out lumen-set]
 *
 * It writes <out>.html and <out>.png. Use it to judge a set side by side: the
 * same ink, the same grain, the same weight of line, masses of the same size.
 * The html holds the pieces inline, and each cell is a host, so hovering a piece
 * (or its name) plays its gesture; the png shows every piece at rest.
 * Exits 2 when there is no browser; the html is still written.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { LINE, PAPER } from "./kit.mjs";
import { shot } from "./chrome.mjs";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { cols: { type: "string", default: "3" }, size: { type: "string", default: "200" }, out: { type: "string", default: "lumen-set" } },
});
if (!positionals.length) {
  console.error("usage: node sheet.mjs <a.svg> [b.svg ...] [--cols 3] [--size 200] [--out lumen-set]");
  process.exit(2);
}

const cols = Math.max(1, +values.cols);
const size = +values.size;
const cells = positionals.map((file) => {
  const svg = readFileSync(file, "utf8");
  const name = /<title>([^<]*)<\/title>/.exec(svg)?.[1] ?? basename(file, ".svg").replace(/^lumen-/, "");
  return { name, svg: svg.trim(), uri: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}` };
});
const rows = Math.ceil(cells.length / cols);
const cellW = Math.round(size * 1.75);
const cellH = Math.round(size * 1.45);
const pad = 40;
const W = cols * cellW + pad * 2;
const H = rows * cellH + pad * 2;

const page = (live) => `<!doctype html><meta charset="utf-8"><title>lumen set</title>
<style>
html,body{margin:0;background:${PAPER}}
.g{display:grid;grid-template-columns:repeat(${cols},${cellW}px);grid-auto-rows:${cellH}px;padding:${pad}px;width:${cols * cellW}px}
.c{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}
.c img,.c svg{width:${size}px;height:${size}px;display:block}
.c b{font:500 12px/1 "Helvetica Neue",Helvetica,Arial,sans-serif;letter-spacing:.07em;text-transform:uppercase;color:${LINE}}
</style>
<div class="g">${cells.map((c) => `<div class="c lm-host">${live ? c.svg : `<img src="${c.uri}" alt="">`}<b>${c.name}</b></div>`).join("")}</div>`;

const htmlFile = resolve(`${values.out}.html`);
const pngFile = resolve(`${values.out}.png`);
writeFileSync(htmlFile, page(true));
const stillFile = join(tmpdir(), `lumen-sheet-${process.pid}.html`);
writeFileSync(stillFile, page(false));
try {
  if (!shot(stillFile, pngFile, { w: W, h: H, scale: 2 })) throw new Error("no picture");
  console.log(pngFile);
} catch (e) {
  console.error(e.message === "no-browser" ? `No browser found: open ${htmlFile} yourself (or set LUMEN_CHROME).` : `Could not take the picture: ${e.message}`);
  process.exit(2);
}
