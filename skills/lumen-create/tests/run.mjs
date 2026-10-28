#!/usr/bin/env node
/**
 * The skill's tests: `node tests/run.mjs`. Each case is a small piece and what the validator should say
 * about it, under a given style. They pin down the one thing that matters about this skill's rigour: the
 * kit and the validator STOP a piece only for what breaks it (errors), and merely NOTE what is a matter
 * of taste (warnings), and a taste can be turned on or off in style.mjs without touching a piece.
 *
 * Add a case when you change a rule. Run it with `--verbose` to see what the validator printed.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const verbose = process.argv.includes("--verbose");
const dir = mkdtempSync(join(tmpdir(), "lumen-tests-"));

/** Runs a piece through validate.mjs (and build.mjs for what the page holds) under an optional style override. */
function run(body, { name = "t", style, strict = false, means = "test" } = {}) {
  const src = `lumen({ name: ${JSON.stringify(name)}, means: ${JSON.stringify(means)}, draw(L) {\n${body}\n} });`;
  writeFileSync(join(dir, "piece.js"), src);
  const env = { ...process.env };
  delete env.LUMEN_STYLE;
  if (style) {
    writeFileSync(join(dir, "style.json"), JSON.stringify(style));
    env.LUMEN_STYLE = join(dir, "style.json");
  }
  const v = spawnSync("node", [join(root, "validate.mjs"), join(dir, "piece.js"), ...(strict ? ["--strict"] : [])], { encoding: "utf8", env });
  const lines = v.stdout.split("\n").filter((l) => /^(error|warn) /.test(l));
  const level = (l) => lines.filter((x) => x.startsWith(l)).map((x) => x.split(/\s+/)[1]);
  const b = spawnSync("node", [join(root, "build.mjs"), join(dir, "piece.js"), "--out", join(dir, "out.svg")], { encoding: "utf8", env, cwd: dir });
  let svg = "";
  try { svg = readFileSync(join(dir, "out.svg"), "utf8"); } catch { /* the build refused */ }
  const text = v.stdout + v.stderr;
  return { code: v.status, errors: level("error"), warns: level("warn"), text, svg, built: b.status === 0 };
}

const results = [];
const check = (label, ok, detail = "") => {
  results.push(ok);
  console.log(`${ok ? "  ok  " : "  FAIL"} ${label}${!ok && detail ? `\n         ${detail}` : ""}`);
};
const has = (list, x) => list.includes(x);
const D = 'const { disc, rect, poly, fade, glow, oval, move, band, arc, beam, box, line, orbit, frame, hull, axes, arrow, glyph, rand } = L;';
const ONE = `${D} disc(100, 100, 40, fade("mist", "deep"));`;

console.log("A sound piece");
let r = run(ONE);
check("passes with no errors and no warnings", r.code === 0 && !r.errors.length && !r.warns.length, r.text);

console.log("\nTaste is a warning, never a refusal");
r = run(ONE, { means: "" });
check("an empty means warns", r.code === 0 && has(r.warns, "declare"));
r = run(`${D} disc(100, 100, 40, fade("mist", "deep")); disc(100, 100, 30, fade("mist", "soft"));`);
check("a nearly flat paint warns (flat), and still draws", r.code === 0 && has(r.warns, "flat") && r.built, r.text);
r = run(`${D} for (let i = 0; i < 12; i++) disc(60 + i * 6, 100, 8, fade("mist", "deep"));`);
check("12 masses warn (parts), and still draw", r.code === 0 && has(r.warns, "parts") && r.built, r.text);
r = run(`${D} const a = disc(100,100,30,fade("mist","deep")); const b = disc(60,60,10,fade("mist","deep")); const c = disc(140,60,10,fade("mist","deep")); const d = disc(60,140,10,fade("mist","deep")); move(a,"swell",{to:1.1}); move(b,"swell",{to:1.1}); move(c,"swell",{to:1.1}); move(d,"swell",{to:1.1});`);
check("4 moves warn (motion)", r.code === 0 && has(r.warns, "motion"), r.text);
r = run(`${D} const a = disc(100,100,30,fade("mist","deep")); move(a,"drift",{dx:40});`);
check("a drift of 40 warns (reach), and still draws", r.code === 0 && has(r.warns, "reach") && r.built, r.text);
r = run(`${D} const a = disc(100,100,30,fade("mist","deep")); move(a,"swell",{to:1.1, delay:1.9});`);
check("a gesture of 2.6s warns (pace)", r.code === 0 && has(r.warns, "pace"), r.text);
r = run(`${D} const a = disc(100,100,30,fade("mist","deep")); move(a,"spin",{by:400});`);
check("a spin of 400 degrees warns (reach)", r.code === 0 && has(r.warns, "reach"), r.text);
r = run(`${D} rect(8, 40, 120, 90, fade("mist", "deep"));`);
check("masses near the edge or too big warn (frame), and still draw", r.code === 0 && has(r.warns, "frame") && r.built, r.text);
r = run(`${D} disc(100, 100, 40, fade("mist", "deep"));`.replace("40", "40"), { strict: true });
check("--strict leaves a sound piece alone", r.code === 0);
r = run(`${D} disc(100, 100, 30, fade("mist", "soft"));`, { strict: true });
check("--strict turns a warning into a stop", r.code === 1, r.text);

console.log("\nWhat breaks a piece is an error");
r = run(`${D} rect(-20, 40, 100, 90, fade("mist", "deep"));`);
check("a drawing cut by the frame is an error (frame)", r.code === 1 && has(r.errors, "frame"), r.text);
r = run(`${D} const a = disc(170,100,20,fade("mist","deep")); move(a,"drift",{dx:24});`);
check("a hover that is swept out of the frame is an error (frame)", r.code === 1 && has(r.errors, "frame"), r.text);
r = run(`${D} disc(100, 100, 40, fade("mist", "deep")); const s = "<text>hi</text>";`);
check("markup written as a string is an error (text)", r.code === 1 && has(r.errors, "text"), r.text);
r = run(`${D} disc(100, 100, 40, fade("mist", "deep")); const c = "#ff0000";`);
check("a colour written as a string is an error (paint)", r.code === 1 && has(r.errors, "paint"), r.text);
r = run(`${D} disc(100, 100, 40, fade("mist", "deep")); const c = "transition: transform 1s";`);
check("css written as a string is an error (motion)", r.code === 1 && has(r.errors, "motion"), r.text);
r = run(ONE, { name: "Bad Name" });
check("a name that is not a safe filename is an error (declare)", r.code === 1 && has(r.errors, "declare"), r.text);
r = run(`${D} disc(100, 100, 40, fade("mist", "deep")); fetch("x");`);
check("reaching for the network is an error (parse), with the reason", r.code === 1 && has(r.errors, "parse") && /cannot load or reach/.test(r.text), r.text);
r = run(`${D} disc(100, 100, 40, "red");`);
check("a flat paint instead of fade() or glow() is an error (parse)", r.code === 1 && has(r.errors, "parse"), r.text);
r = run(`${D} disc(100, 100, 40, fade("mist", "nowhere"));`);
check("an unknown level is an error (parse)", r.code === 1 && has(r.errors, "parse"), r.text);

console.log("\nWords are not forbidden, only what they would write");
r = run(`${D} const fill = 40, style = "plain", color = 2; disc(100, 100, fill, fade("mist", "deep"));`);
check("variables called fill, style and color are fine", r.code === 0 && !r.errors.length, r.text);

console.log("\nRandomness: allowed, if it is seeded");
r = run(`${D} disc(100, 100, 40, fade("mist", "deep")); Math.random();`);
check("Math.random says where to find a seeded one", r.code === 1 && /L\.rand\(seed\)/.test(r.text), r.text);
const seeded = `${D} const r = rand(7); for (let i = 0; i < 5; i++) disc(40 + r() * 120, 40 + r() * 120, 12, fade("mist", "deep"));`;
const a1 = run(seeded), a2 = run(seeded);
check("rand(seed) draws the same piece every run", a1.code === 0 && a1.svg.length > 100 && a1.svg === a2.svg, a1.text);

console.log("\nLines are a taste, off by default");
const lineBody = `${D} disc(100, 100, 40, fade("mist", "deep")); line([[20,100],[180,100]]); orbit(100,100,60,20); frame(30,30,140,140); hull([[40,40],[160,40],[100,160]]); axes(30,30,170,170);`;
r = run(lineBody);
check("by default line() is refused, with how to turn it on", r.code === 1 && /style\.mjs/.test(r.text) && /lines\.allowed/.test(r.text), r.text);
r = run(`${D} disc(100, 100, 40, fade("mist", "deep")); arrow(20,20,60,60);`);
check("by default arrow() is refused", r.code === 1 && /style\.mjs/.test(r.text), r.text);
r = run(lineBody, { style: { lines: { allowed: true } } });
check("with lines on, line, orbit, frame, hull and axes draw", r.code === 0 && !r.errors.length && /stroke-width="1"/.test(r.svg), r.text);
r = run(`${D} disc(100, 100, 40, fade("mist", "deep")); arrow(20,20,60,60);`, { style: { lines: { allowed: true } } });
check("with lines on but arrows off, arrow() is still refused", r.code === 1 && /lines\.arrows/.test(r.text), r.text);
r = run(`${D} disc(100, 100, 40, fade("mist", "deep")); arrow(20,20,60,60);`, { style: { lines: { allowed: true, arrows: true } } });
check("with arrows on, arrow() draws", r.code === 0 && !r.errors.length, r.text);
r = run(`${D} disc(100, 100, 40, fade("mist", "deep")); line([[20,100],[180,100]]);`, { style: { lines: { allowed: true, weight: 2.5, opacity: 0.4 } } });
check("the weight and opacity of lines come from style.mjs", /stroke-width="2.5"/.test(r.svg) && /stroke-opacity="0.4"/.test(r.svg), r.svg.slice(0, 300));
r = run(`${D} disc(100, 100, 40, fade("mist", "deep")); glyph("plus", 100, 100, 20);`);
check("a stroked glyph needs lines on", r.code === 1, r.text);

console.log("\nLoops are a taste, off by default");
const loopBody = `${D} const a = disc(100,100,40,fade("mist","deep")); const b = band(100,100,60,24,6,fade("soft","deep")); move(b,"spin",{loop:6}); move(a,"swell",{to:1.08, loop:5});`;
r = run(`${D} const a = disc(100,100,40,fade("mist","deep")); move(a,"spin",{loop:6});`);
check("by default a loop is refused, with how to turn it on", r.code === 1 && /motion\.loops/.test(r.text), r.text);
r = run(`${D} const a = disc(100,100,40,fade("mist","deep")); L.loop(5);`);
check("the old loop() says what replaced it", r.code === 1 && /loop: seconds/.test(r.text), r.text);
r = run(loopBody, { style: { motion: { loops: true } } });
check("with loops on, a move can loop: keyframes, and reduced motion honoured", r.code === 0 && !r.errors.length && /@keyframes/.test(r.svg) && /prefers-reduced-motion/.test(r.svg) && !/:hover/.test(r.svg), r.text);
r = run(`${D} const a = disc(100,100,40,fade("mist","deep")); const b = disc(100,100,20,fade("mist","deep")); move(a,"swell",{to:1.08}); move(b,"spin",{loop:6});`, { style: { motion: { loops: true } } });
check("a piece can mix a hover move and a loop move", r.code === 0 && /:hover/.test(r.svg) && /@keyframes/.test(r.svg), r.text);

console.log("\nThe rest of the style is yours too");
r = run(ONE, { style: { grain: { on: false } } });
check("grain can be turned off", r.code === 0 && !/lm-grain/.test(r.svg));
r = run(`${D} disc(100, 100, 40, fade("mist", "deep")); disc(100, 100, 20, fade("mist", "deep"));`, { style: { limits: { masses: 1 } } });
check("limits are style.mjs's: with a limit of 1 mass, two masses warn", r.code === 0 && has(r.warns, "parts"), r.text);
r = run(`${D} disc(100, 100, 40, fade("mist", "deep")); disc(100, 100, 20, fade("mist", "deep"));`, { style: { limits: { masses: 5 } } });
check("and with a limit of 5, two masses are fine", r.code === 0 && !r.warns.length, r.text);

const passed = results.filter(Boolean).length;
console.log(`\n${passed} / ${results.length} cases${passed === results.length ? "" : ": SOME FAILED"}`);
process.exit(passed === results.length ? 0 : 1);
