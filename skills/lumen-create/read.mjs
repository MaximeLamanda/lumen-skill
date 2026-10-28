#!/usr/bin/env node
/**
 * Reads a drawing the person brought, for lumen-adopt: `node read.mjs <file> [name]`.
 *
 * For an .svg it writes two files in the working directory:
 *   lumen-<name>-source.png   the drawing as a picture (on dark when its ink is light)
 *   lumen-<name>-source.txt   the card: viewBox, title, counts, the ink's box, and one line per
 *                             painted shape with its box, its paint and the shape it sits in
 * For a png, jpg or webp there is no shape data: it only says so, and the picture is the file itself.
 * The browser measures the shapes, so transforms and styles are already applied.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, extname, join, resolve } from "node:path";
import { dom, shot } from "./chrome.mjs";

const [file, given] = process.argv.slice(2);
if (!file) {
  console.error("usage: node read.mjs <file.svg|png|jpg|webp> [name]");
  process.exit(2);
}
const ext = extname(file).toLowerCase();
const name = (given ?? basename(file, ext)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "source";

if (ext !== ".svg") {
  console.log(`${file} is a picture, not a drawing: there is no shape data to read. Look at it (open the file) and answer source.md's questions from what you see. The card's measures (boxes, proportions) are yours to estimate by eye.`);
  process.exit(0);
}

const svg = readFileSync(file, "utf8");
if (!/<svg[\s>]/.test(svg)) {
  console.error(`${file} is not an svg.`);
  process.exit(2);
}

const page = join(tmpdir(), `lumen-${name}-read.html`);
const probe = `<!doctype html><meta charset="utf-8"><style>body{margin:0}svg{display:block;width:800px;height:auto}</style>${svg.replace(/<\?xml[^>]*\?>/, "")}<pre id="m" style="display:none"></pre><script>
const s = document.querySelector("svg"), vb = s.viewBox.baseVal, r0 = s.getBoundingClientRect();
const k = vb && vb.width ? vb.width / r0.width : 1, ox = vb ? vb.x : 0, oy = vb ? vb.y : 0;
const shapes = [...s.querySelectorAll("path,rect,circle,ellipse,polygon,polyline,line")].filter((e) => !e.closest("defs,clipPath,mask,symbol,pattern,marker")).map((e) => {
  const c = getComputedStyle(e), r = e.getBoundingClientRect();
  return { tag: e.tagName, id: e.id || "", fill: c.fill, stroke: c.stroke, op: c.opacity, box: [(r.left - r0.left) * k + ox, (r.top - r0.top) * k + oy, (r.right - r0.left) * k + ox, (r.bottom - r0.top) * k + oy] };
});
document.getElementById("m").textContent = JSON.stringify({
  vb: vb ? [vb.x, vb.y, vb.width, vb.height] : null, title: (s.querySelector("title") || {}).textContent || "",
  gradients: s.querySelectorAll("linearGradient,radialGradient").length, filters: s.querySelectorAll("filter").length,
  text: [...s.querySelectorAll("text")].map((t) => t.textContent.trim()).filter(Boolean), shapes,
});
</script>`;
writeFileSync(page, probe);

let m;
try {
  m = JSON.parse(/<pre id="m"[^>]*>([\s\S]*?)<\/pre>/.exec(dom(page))?.[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">") ?? "");
} catch (e) {
  console.error(e.message === "no-browser" ? "No browser found (set LUMEN_CHROME): the svg could not be measured. Read its own text: each shape's attributes give its box well enough for proportions. Say at hand-over that the source was NOT seen in a browser." : `Could not read the drawing: ${e.message}`);
  process.exit(2);
}

const r = (v) => Math.round(v * 10) / 10;
const w = (b) => r(b[2] - b[0]), h = (b) => r(b[3] - b[1]);
const painted = m.shapes.filter((s) => s.fill !== "none" || (s.stroke !== "none" && s.stroke !== "rgba(0, 0, 0, 0)"));
const boxes = painted.map((s) => s.box);
const ink = boxes.length ? [Math.min(...boxes.map((b) => b[0])), Math.min(...boxes.map((b) => b[1])), Math.max(...boxes.map((b) => b[2])), Math.max(...boxes.map((b) => b[3]))] : null;
const inside = (a, b) => a !== b && a[0] >= b[0] - 0.5 && a[1] >= b[1] - 0.5 && a[2] <= b[2] + 0.5 && a[3] <= b[3] + 0.5;
const lum = (c) => { const v = /rgba?\((\d+), (\d+), (\d+)/.exec(c); return v ? 0.3 * v[1] + 0.59 * v[2] + 0.11 * v[3] : null; };
const lights = painted.map((s) => lum(s.fill) ?? lum(s.stroke)).filter((v) => v !== null);
const light = lights.length > 0 && lights.filter((v) => v > 200).length / lights.length > 0.6;
const counts = {};
for (const s of painted) counts[s.tag] = (counts[s.tag] ?? 0) + 1;

const lines = [
  `source   ${file}`,
  `viewBox  ${m.vb ? m.vb.map(r).join(" ") : "none"}${m.title ? `   title "${m.title}"` : ""}`,
  `shapes   ${painted.length} painted (${Object.entries(counts).map(([t, n]) => `${t} ${n}`).join(", ") || "none"}); ${m.gradients} gradients, ${m.filters} filters${m.text.length ? `; text: ${m.text.map((t) => `"${t}"`).join(" ")}` : ""}`,
  ink ? `ink box  ${ink.map(r).join(", ")}  (${w(ink)} x ${h(ink)}, ratio ${r(w(ink) / (h(ink) || 1))})` : "ink box  none",
  light ? "ink      light: the picture is shown on dark" : "ink      dark or coloured",
  "",
];
painted.forEach((s, i) => {
  const parent = painted.findIndex((p) => inside(s.box, p.box) && p !== s && w(p.box) * h(p.box) > w(s.box) * h(s.box));
  lines.push(`#${i + 1} ${s.tag}${s.id ? ` #${s.id}` : ""}  box ${s.box.map(r).join(", ")}  (${w(s.box)} x ${h(s.box)})  centre ${r((s.box[0] + s.box[2]) / 2)}, ${r((s.box[1] + s.box[3]) / 2)}  fill ${s.fill}  stroke ${s.stroke}${parent >= 0 ? `  in #${parent + 1}` : ""}`);
});
const card = resolve(`lumen-${name}-source.txt`);
writeFileSync(card, lines.join("\n") + "\n");

const view = join(tmpdir(), `lumen-${name}-source.html`);
writeFileSync(view, `<!doctype html><body style="margin:0;background:${light ? "#1b1d33" : "#F3F1FD"}"><div style="width:600px;height:600px;display:flex;align-items:center;justify-content:center"><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}" style="max-width:520px;max-height:520px;min-width:300px;min-height:300px"></div>`);
const png = resolve(`lumen-${name}-source.png`);
try { shot(view, png, { w: 600, h: 600 }); console.log(png); } catch { /* the card is still written */ }
console.log(card);
