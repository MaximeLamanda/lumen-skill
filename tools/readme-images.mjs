#!/usr/bin/env node
/**
 * Makes the pictures of the README (docs/*.png) from gallery/, with the repo's own tools:
 *
 *   node tools/readme-images.mjs
 *
 * They are laid out as plates of figures: pale cards with a soft shadow, a caption in each corner
 * (figure number, name, the gesture on hover, the state shown). Every picture is a real render of a
 * piece through the kit, frozen part of the way through its hover where a picture needs it.
 * Needs Node 18+ and a Chrome (or Chromium, Edge, Brave) on the machine.
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { draw } from "../skills/lumen-create/build.mjs";
import { shot } from "../skills/lumen-create/chrome.mjs";
import { INK } from "../skills/lumen-create/kit.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const out = resolve(root, "docs");
mkdirSync(out, { recursive: true });
const tmp = join(tmpdir(), `lumen-readme-${process.pid}`);
mkdirSync(tmp, { recursive: true });

/** What each piece does when a hand comes to it: the caption under the figure. */
const VERB = {
  "ev-charging": "plug docks, pills fill",
  energy: "beams burst out",
  nuclear: "orbits turn",
  cloud: "data climbs in",
  analytics: "bars grow in turn",
  mail: "flap lifts",
  "mobile-app": "cards scroll",
  payment: "card advances",
  search: "result sweeps",
  team: "sides step in",
  support: "bubbles part",
  settings: "gears turn",
};
const WEB = Object.keys(VERB);

const source = (name) => readFileSync(join(root, "gallery/web-design", `${name}.js`), "utf8");
const svgOf = (name, hover) => draw(source(name), { grain: true, animate: hover !== undefined, hover }).svg;
const uri = (svg) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
const label = (s) => s.replace(/-/g, " ");

const CSS = `
:root{--bg:#EEEDF6;--card:#FCFCFF;--line:#E2E0EE;--mut:#8C8BA3;--faint:#B7B6C9}
*{box-sizing:border-box}
html,body{margin:0;background:var(--bg)}
body{font:500 9px/1 ui-monospace,"SF Mono",Menlo,Consolas,monospace;color:var(--mut);letter-spacing:.09em;text-transform:uppercase}
.g{display:grid;gap:18px;padding:40px;width:max-content}
.c{position:relative;background:var(--card);border:1px solid var(--line);border-radius:12px;box-shadow:0 1px 2px rgba(30,30,80,.05),0 10px 28px rgba(30,30,80,.06)}
.c img{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)}
.c i{position:absolute;font-style:normal;white-space:nowrap}
.tl{left:14px;top:13px}.tr{right:14px;top:13px}.bl{left:14px;bottom:13px}.br{right:14px;bottom:13px;color:var(--faint)}
`;

/** One card: a figure, and the four corner captions. */
const card = ({ w, h, f, src, tl, tr, bl, br }) =>
  `<div class="c" style="width:${w}px;height:${h}px"><i class="tl">${tl ?? ""}</i><i class="tr">${tr ?? ""}</i><img src="${src}" style="width:${f}px;height:${f}px" alt=""><i class="bl">${bl ?? ""}</i><i class="br">${br ?? ""}</i></div>`;

function plate(file, cols, cards, { w, h }) {
  const rows = Math.ceil(cards.length / cols);
  const W = cols * w + (cols - 1) * 18 + 80;
  const H = rows * h + (rows - 1) * 18 + 80;
  const page = join(tmp, `${file}.html`);
  writeFileSync(page, `<!doctype html><meta charset="utf-8"><style>${CSS}.g{grid-template-columns:repeat(${cols},${w}px)}</style><div class="g">${cards.join("")}</div>`);
  if (!shot(page, join(out, `${file}.png`), { w: W, h: H, scale: 2 })) throw new Error(`no picture for ${file}`);
  console.log(`docs/${file}.png`);
}

const fig = (n, i) => `Fig ${n}.${i + 1}`;

// 1. hero: six pieces, at rest
const HERO = ["nuclear", "ev-charging", "cloud", "mobile-app", "settings", "payment"];
plate("hero", 3, HERO.map((n, i) => card({ w: 300, h: 232, f: 172, src: uri(svgOf(n)), tl: fig(1, i), tr: label(n), bl: `hover . ${VERB[n]}`, br: "rest" })), { w: 300, h: 232 });

// 2. gallery: the twelve classic web-design subjects
plate("gallery", 4, WEB.map((n, i) => card({ w: 236, h: 196, f: 132, src: uri(svgOf(n)), tl: fig(2, i), tr: label(n), bl: `hover . ${VERB[n]}`, br: "rest" })), { w: 236, h: 196 });

// 3. hover: four pieces, from rest to the hover pose in five steps (frozen frames of the real css gesture)
const STEPS = ["rest", "25%", "50%", "75%", "hover"];
const HOVER = ["mobile-app", "cloud", "nuclear", "payment"];
plate("hover", 5, HOVER.flatMap((n, r) => STEPS.map((s, k) => card({ w: 168, h: 156, f: 104, src: uri(svgOf(n, k / (STEPS.length - 1))), tl: k === 0 ? label(n) : "", tr: k === 0 ? "" : "", bl: k === 0 ? VERB[n] : "", br: s }))), { w: 168, h: 156 });

// 4. inks: the same piece with another ink, by replacing one hex in the file
const INKS = ["#4553FE", "#0CA678", "#E8590C", "#7048E8"];
const base = svgOf("support");
plate("inks", 4, INKS.map((c, i) => card({ w: 236, h: 196, f: 132, src: uri(base.replaceAll(INK, c)), tl: fig(4, i), tr: c, bl: "one hex . one ink", br: i === 0 ? "default" : "replaced" })), { w: 236, h: 196 });

// 5. look: the sheet the check writes for a piece (measures, small sizes, hover frames)
const look = spawnSync("node", [join(root, "skills/lumen-create/look.mjs"), join(root, "gallery/web-design/nuclear.js")], { cwd: tmp, encoding: "utf8" });
copyFileSync(join(tmp, "lumen-nuclear-look.png"), join(out, "look.png"));
console.log("docs/look.png");
console.log(look.stdout.split("\n").filter((l) => /^\s*\d+ /.test(l)).join("\n"));
