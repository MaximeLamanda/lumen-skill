#!/usr/bin/env node
/**
 * The variants sheet: several compositions of ONE concept, side by side, numbered, so the person picks one.
 *
 *   node variants.mjs <1.js> <2.js> <3.js> <4.js> <5.js> [--size 160] [--out lumen-variants]
 *
 * Each file is a variant, written as a piece (`lumen({ name, means, draw })`) but drawn as a still: a
 * `move()` in a variant is left out here, because the hover is designed for the one that is chosen. The
 * variants take the names the sheet gives them (1, 2, 3, ...), never their own: the person chooses a
 * composition, not a name. Each is validated (an error stops the run and says which variant) and drawn
 * with its grain, then the sheet shows it at `--size` px, at 64px and as a value study (grey). The full
 * look (look.mjs) is for the chosen one only.
 *
 * It writes <out>.png and prints one line for each variant (masses, ink box, what the validator said),
 * and a note when two variants are too alike to be worth choosing between (same masses, same box).
 * Exits 1 when a variant is rejected by the validator, 2 when there is no browser.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { draw } from "./build.mjs";
import { LINE, PAPER, STYLE } from "./kit.mjs";
import { shot } from "./chrome.mjs";
import { blocking, validate } from "./validate.mjs";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: { size: { type: "string", default: "160" }, out: { type: "string", default: "lumen-variants" } },
});
if (positionals.length < 2) {
  console.error("usage: node variants.mjs <1.js> <2.js> [... up to 6] [--size 160] [--out lumen-variants]");
  process.exit(2);
}
if (positionals.length > 6) {
  console.error("variants: six at most. More than that is not a choice any more.");
  process.exit(2);
}

const V = STYLE.variants;
const size = +values.size;
const uri = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
const box = (b) => (b ? b.map(Math.round).join(",") : "none");

const cards = [];
let rejected = false;
positionals.forEach((file, i) => {
  const n = i + 1;
  const source = readFileSync(file, "utf8");
  const found = validate(source);
  for (const f of found) {
    // a variant is a sketch with no hover: what only concerns the hover is not its business yet
    if (f.check === "motion" && f.level === "warn") continue;
    console.log(`${String(n).padStart(2)} ${f.level.padEnd(5)} ${f.check.padEnd(8)} ${f.msg}`);
  }
  if (blocking(found).length) {
    rejected = true;
    return;
  }
  const r = draw(source, { grain: true });
  if (r.stats.motions) console.log(`${String(n).padStart(2)} note  motion   ${r.stats.motions} move() call(s) left out of the sheet: the hover is designed for the chosen variant.`);
  if (n > 1 && r.stats.parts > V.masses) console.log(`${String(n).padStart(2)} warn  parts    ${r.stats.parts} masses, over ${V.masses}: a variant is a minimal composition (see concepts.md, "Five compositions").`);
  cards.push({ n, file, svg: r.svg, parts: r.stats.parts, mass: r.stats.mass });
});
if (rejected) {
  console.log("The validator stopped at least one variant. Fix the errors, then run the sheet again (warnings are yours to judge).");
  process.exit(1);
}

// two variants that cannot be told apart are one variant: same number of masses, and the masses fill the same box
for (let a = 0; a < cards.length; a++) {
  for (let b = a + 1; b < cards.length; b++) {
    const [p, q] = [cards[a], cards[b]];
    const close = p.parts === q.parts && p.mass && q.mass && p.mass.every((v, k) => Math.abs(v - q.mass[k]) < 4);
    if (close) console.log(`${String(q.n).padStart(2)} warn  alike    variants ${p.n} and ${q.n} have the same number of masses and fill almost the same box: they may be one variant twice. Look at them side by side, and if they are, change the core, the view or the frame of one.`);
  }
}
for (const c of cards) console.log(`${String(c.n).padStart(2)} ok    sketch   ${c.parts} mass(es), masses fill ${box(c.mass)}`);

const cellW = size + 56;
const cellH = size + 140;
const pad = 28;
const cols = cards.length;
const W = pad * 2 + cols * cellW;
const H = pad * 2 + cellH;
const html = `<!doctype html><meta charset="utf-8"><title>lumen variants</title>
<style>
html,body{margin:0;background:${PAPER};font:500 12px/1 "Helvetica Neue",Helvetica,Arial,sans-serif;color:${LINE}}
.g{display:grid;grid-template-columns:repeat(${cols},${cellW}px);padding:${pad}px;width:${cols * cellW}px}
.c{display:flex;flex-direction:column;align-items:center;gap:14px}
.c .n{font-size:22px;letter-spacing:.04em}
.c .big{width:${size}px;height:${size}px;display:block}
.c .sm{display:flex;gap:14px;align-items:center}
.c .sm img{width:64px;height:64px;display:block}
.c .sm img.grey{filter:grayscale(1)}
.c small{font-size:9px;letter-spacing:.07em;text-transform:uppercase;opacity:.55}
</style>
<div class="g">${cards
  .map((c) => `<div class="c"><span class="n">${c.n}</span><img class="big" src="${uri(c.svg)}" alt=""><div class="sm"><img src="${uri(c.svg)}" alt=""><img class="grey" src="${uri(c.svg)}" alt=""></div><small>64px . value study</small></div>`)
  .join("")}</div>`;

const page = join(tmpdir(), `lumen-variants-${process.pid}.html`);
writeFileSync(page, html);
const png = resolve(`${values.out}.png`);
try {
  if (!shot(page, png, { w: W, h: H, scale: 2 })) throw new Error("no picture");
  console.log(png);
} catch (e) {
  console.error(e.message === "no-browser" ? "No browser found (set LUMEN_CHROME): the sheet could not be taken. Judge the variants from their code, say so, and ask the person to pick." : `Could not take the picture: ${e.message}`);
  process.exit(2);
}
