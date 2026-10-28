#!/usr/bin/env node
/**
 * Draws a piece with the kit: `node build.mjs <piece.js> [--still|--hover] [--grain none] [--paper] [--out file.svg]`
 * writes lumen-<name>.svg in the working directory and prints where it is. A piece that moves is
 * written animated (css transitions on hover, no script, still when the viewer asks for reduced
 * motion); --still writes the rest pose alone, --hover the hover pose alone.
 *
 * The piece runs in a sandbox that has `lumen`, `Math` (without `random`) and
 * nothing else, so a piece cannot read a file, reach the network or draw
 * differently from one run to the next.
 */
import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import vm from "node:vm";
import { createKit } from "./kit.mjs";

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const safeMath = Object.fromEntries(Object.getOwnPropertyNames(Math).filter((k) => k !== "random").map((k) => [k, Math[k]]));
safeMath.random = () => {
  throw new Error("lumen: Math.random is off so that a piece draws the same every time. Use L.rand(seed), a seeded generator: const r = L.rand(7); r() gives the same number every run");
};

/** Runs a piece's source: what it declared, the kit it drew on, and the page. Throws what the piece or the kit threw. */
export function draw(source, { grain = true, paper = false, animate = false, hover } = {}) {
  let spec = null;
  let calls = 0;
  const sandbox = { lumen: (s) => { calls++; spec = s; }, Math: safeMath };
  vm.runInNewContext(source, sandbox, { timeout: 2000, filename: "piece.js" });
  if (calls !== 1 || !spec) throw new Error("lumen: the piece must call lumen({ name, means, rules, draw }) once");
  if (typeof spec.draw !== "function") throw new Error("lumen: lumen() needs a draw(L) function");
  const kit = createKit();
  spec.draw(kit);
  return { spec, kit, stats: kit.measure(), svg: kit.svg({ name: spec.name, means: spec.means, grain, paper, animate, hover }) };
}

/** The piece's name, read from its declaration. */
export function nameOf(source) {
  const call = [...source.matchAll(/\blumen\s*\(\s*\{/g)].at(-1);
  return call ? /\bname:\s*["'`]([a-z][a-z0-9-]*)["'`]/.exec(source.slice(call.index))?.[1] ?? null : null;
}

/* The skill is often installed as a symlink, so the path Node was given is resolved before it is compared. */
if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(here("./build.mjs"))) {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: { still: { type: "boolean", default: false }, hover: { type: "boolean", default: false }, grain: { type: "string", default: "fine" }, paper: { type: "boolean", default: false }, out: { type: "string" } } });
  if (!positionals[0]) {
    console.error("usage: node build.mjs <piece.js> [--still|--hover] [--grain none] [--paper] [--out file.svg]");
    process.exit(2);
  }
  const source = readFileSync(positionals[0], "utf8");
  try {
    const r = draw(source, { grain: values.grain !== "none", paper: values.paper, animate: !values.still, hover: values.hover ? 1 : undefined });
    const file = resolve(values.out ?? `lumen-${r.spec.name}.svg`);
    writeFileSync(file, r.svg);
    console.log(file);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
