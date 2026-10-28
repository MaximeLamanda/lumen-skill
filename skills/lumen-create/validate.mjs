#!/usr/bin/env node
/**
 * Checks a piece: `node validate.mjs <piece.js> [--strict]`.
 *
 * Two levels, and the difference is the point:
 *
 *   error  the piece cannot be drawn, would break the file, or leaves the style's identity: it must be
 *          fixed. A script or markup in the svg, a colour that is not the palette, a drawing that leaves
 *          the frame and is cut, a name that is not a safe filename, css the kit did not write.
 *   warn   a matter of taste or of readability, with its limit in style.mjs: too many parts, masses too
 *          small or too big, a paint that reads flat, a gesture that drags, a drawing close to the edge.
 *          The piece is still handed over; the person decides. `--strict` turns warnings into errors.
 *
 * It prints one line per finding, then `ok` (or `ok, N warnings`), and exits 1 only on an error.
 *
 *   parse     the piece runs in the sandbox and the kit accepts every call
 *   declare   lumen({ name, means, draw }): a name that is a safe filename
 *   text      no words and no markup inside the piece (rule 10)
 *   paint     no colour or paint attribute written by the piece (rules 01, 02)
 *   motion    motion only through the kit; the page honours reduced motion and answers the hover (rules 11 to 15)
 *   frame     nothing cut by the frame; then, as warnings, margins, size and centring (rule 09)
 *   svg       the page the kit wrote holds only the palette, no text, no image, no script
 */
import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { draw } from "./build.mjs";
import { INK, LINE, PAPER, SIZE, STYLE } from "./kit.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const L = STYLE.limits;

/** A piece's source split the way JavaScript reads it: its code with the comments dropped and each string emptied, and the strings apart. */
export function split(src) {
  let code = "";
  const strs = [];
  for (let i = 0; i < src.length; ) {
    const c = src[i], d = src[i + 1];
    if (c === "/" && d === "/") { while (i < src.length && src[i] !== "\n") i++; }
    else if (c === "/" && d === "*") { const e = src.indexOf("*/", i + 2); i = e < 0 ? src.length : e + 2; code += " "; }
    else if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < src.length && src[j] !== c && (c === "`" || src[j] !== "\n")) j += src[j] === "\\" ? 2 : 1;
      strs.push(src.slice(i + 1, j));
      code += c + c;
      i = j + 1;
    } else { code += c; i++; }
  }
  return { code, strs };
}

/** What a piece must not write as a string: it would be writing svg, colour or css itself, which is the kit's. The words of its code are its own business. */
const IN_STRINGS = [
  ["text", /<\s*\/?\s*[a-zA-Z!]/, "rule 10. No markup written as a string: a piece calls the kit and never writes svg."],
  ["paint", /#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|color-mix)\(|\burl\(|\b(?:fill|stroke|opacity|stop-color)\s*[=:]/, "rule 01. A colour or a paint attribute written as a string. The ink and the paper are the kit's: name a level (core, deep, mid, soft, mist, air)."],
  ["motion", /@keyframes|\b(?:animation|transition|transform)\s*:|<\s*animate/, "rules 11 to 15. Motion written as css. Use L.move(handle, kind, opts): the kit owns the clock, the easing and the trigger."],
];

/** What is wrong with a piece: [{ level: "error" | "warn", check, msg }]. */
export function validate(source) {
  const out = [];
  const error = (check, msg) => out.push({ level: "error", check, msg });
  const warn = (check, msg) => out.push({ level: "warn", check, msg });
  const { strs } = split(source);
  for (const [check, re, msg] of IN_STRINGS) {
    const hit = strs.map((s) => re.exec(s)).find(Boolean);
    if (hit) error(check, `${msg} (found "${hit[0].trim()}")`);
  }
  const lines = source.replace(/\n+$/, "").split("\n").length;
  if (lines > L.codeLines) warn("length", `${lines} lines of code, over ${L.codeLines}: a piece this long is often two ideas.`);

  let r;
  try {
    r = draw(source, { animate: true });
  } catch (e) {
    const sandbox = /^(\w+) is not defined$/.exec(e.message);
    error("parse", sandbox ? `${e.message}. A piece has lumen, Math and the kit (L) and nothing else: it cannot load or reach anything.` : e.message);
    return out;
  }
  const { spec, stats, svg } = r;
  if (typeof spec.name !== "string" || !/^[a-z0-9][a-z0-9_-]{0,39}$/.test(spec.name)) error("declare", "name: it becomes the filename, so lowercase letters, digits, - and _ only, up to 40 characters.");
  if (typeof spec.means !== "string" || !spec.means.trim()) warn("declare", "means: one sentence saying what the piece shows would make a good <desc> and alt text.");

  for (const w of stats.warnings) warn(w.code, w.msg);

  if (stats.parts < 1) error("parts", "Nothing is painted: a piece needs at least one mass.");
  if (stats.parts > L.masses) warn("parts", `${stats.parts} masses, over ${L.masses} (rule 06): two or three parts make an object, the rest is often decoration.`);
  if (stats.glyphs > L.glyphs) warn("parts", `${stats.glyphs} marks, over ${L.glyphs} (rule 10).`);
  if (stats.lines > L.hairlines) warn("parts", `${stats.lines} lines, over ${L.hairlines} (rule 05).`);
  if (stats.motions > L.moves) warn("motion", `${stats.motions} move() calls, over ${L.moves} (rule 11): one piece, one verb.`);
  if (stats.moving > L.moving) warn("motion", `${stats.moving} parts move, over ${L.moving} (rule 11).`);
  if (stats.motions && !svg.includes("prefers-reduced-motion")) error("motion", "the page does not honour prefers-reduced-motion (rule 15).");
  if (stats.hovers && !/:hover/.test(svg)) error("motion", "the page does not answer the hover (rule 11).");
  if (/<(?:animate|animateTransform|animateMotion|set)\b|<script\b/.test(svg)) error("motion", "the page holds SMIL or a script. The motion is css, written by the kit (rule 15).");
  if (!stats.loops && /@keyframes|\banimation\s*:/.test(svg)) error("motion", "the page holds keyframes, but no move runs on a loop.");

  const { mass, all } = stats;
  const edge = L.edge, margin = L.margin;
  const cut = (b) => b[0] < 0 || b[1] < 0 || b[2] > SIZE || b[3] > SIZE;
  if (all && cut(all)) error("frame", `the drawing reaches [${all.map(Math.round)}], outside the ${SIZE} x ${SIZE} frame: it would be cut.`);
  if (stats.sweptAll && cut(stats.sweptAll)) error("frame", `on hover the drawing is swept out to [${stats.sweptAll.map(Math.round)}], outside the frame: it would be cut. Shorten the move, or draw the piece smaller.`);
  const near = (b, m) => b[0] < m || b[1] < m || b[2] > SIZE - m || b[3] > SIZE - m;
  if (all && !cut(all) && near(all, edge)) warn("frame", `the drawing reaches [${all.map(Math.round)}], within ${edge} units of the edge (rule 09).`);
  if (mass && near(mass, margin) && !cut(mass)) warn("frame", `a mass reaches [${mass.map(Math.round)}], within ${margin} units of the edge: it will feel cramped in a card (rule 09).`);
  if (mass) {
    const big = Math.max(mass[2] - mass[0], mass[3] - mass[1]);
    if (big < L.longSide[0] || big > L.longSide[1]) warn("frame", `the masses span ${Math.round(big)} units on their longer side; ${L.longSide[0]} to ${L.longSide[1]} usually reads as one object at 64px (rule 09).`);
  }
  if (all) {
    const cx = (all[0] + all[2]) / 2, cy = (all[1] + all[3]) / 2;
    if (Math.hypot(cx - SIZE / 2, cy - SIZE / 2) > L.centre) warn("frame", `the drawing's centre is (${Math.round(cx)}, ${Math.round(cy)}), more than ${L.centre} units from (${SIZE / 2}, ${SIZE / 2}) (rule 09).`);
  }
  if (stats.sweptAll && !cut(stats.sweptAll) && near(stats.sweptAll, edge)) warn("frame", `on hover the drawing comes within ${edge} units of the edge (rule 14).`);
  const fades = stats.fades;
  if (fades.length >= 2 && fades.filter((a) => a >= 45 && a <= 135).length < fades.length * L.settle) warn("settle", "most linear fades run sideways or upward: the ink usually settles to the base, lighter at the top (rule 03).");

  const palette = [INK, LINE, PAPER].map((x) => x.toUpperCase());
  for (const c of new Set((svg.match(/#[0-9a-fA-F]{6}/g) ?? []).map((c) => c.toUpperCase()))) if (!palette.includes(c)) error("svg", `the page holds a colour that is not the palette: ${c}.`);
  if (/<(?:text|tspan|image|script|foreignObject)\b|href=/.test(svg)) error("svg", "the page holds text, an image or a script.");
  const styles = svg.match(/<style>[\s\S]*?<\/style>/g) ?? [];
  if (styles.length > 1 || styles.some((x) => !x.startsWith("<style>@media (prefers-reduced-motion:no-preference){")) || (styles.length && !stats.motions)) error("svg", "the page holds a style that is not the kit's motion.");
  if (!svg.includes(`viewBox="0 0 ${SIZE} ${SIZE}"`)) error("svg", `the viewBox is not 0 0 ${SIZE} ${SIZE}.`);
  return out;
}

/** The findings that stop a piece: errors, and with `strict` the warnings too. */
export const blocking = (found, strict = false) => found.filter((f) => f.level === "error" || strict);

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(here("./validate.mjs"))) {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: { strict: { type: "boolean", default: false } } });
  if (!positionals[0]) {
    console.error("usage: node validate.mjs <piece.js> [--strict]");
    process.exit(2);
  }
  const found = validate(readFileSync(positionals[0], "utf8"));
  for (const f of found) console.log(`${f.level.padEnd(5)} ${f.check.padEnd(8)} ${f.msg}`);
  const stop = blocking(found, values.strict);
  const warns = found.filter((f) => f.level === "warn").length;
  if (stop.length) process.exit(1);
  console.log(warns ? `ok, ${warns} warning${warns > 1 ? "s" : ""}` : "ok");
}
