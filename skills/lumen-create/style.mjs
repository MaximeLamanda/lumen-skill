/**
 * The Lumen style: the one file that is yours.
 *
 * `kit.mjs` is the mechanics (it draws, it measures, it writes the css) and it does not change when
 * your taste does. This file is what changes. Edit a value, run the look again, and every piece of the
 * set follows. Nothing here needs a piece to be rewritten, except where a piece used something you
 * turn off (the kit then says which part, and why).
 *
 * Three sections, from the most to the least firm:
 *
 *   IDENTITY   what makes a piece Lumen. Change it only if you mean to change the whole look.
 *   TASTE      what you like today. These are defaults, not laws: flip them whenever you change your mind.
 *   LIMITS     rules of thumb that keep a piece readable at 64px. A piece that goes past one gets a
 *              warning, never a refusal; `node validate.mjs --strict` turns warnings into errors.
 */

export const STYLE = {
  // ---------------------------------------------------------------- IDENTITY
  palette: { paper: "#F3F1FD", ink: "#4553FE", line: "#3C46C0" }, // `line` is the blue of captions, and of lines when you turn them on
  levels: { core: 1, deep: 0.78, mid: 0.52, soft: 0.3, mist: 0.14, air: 0.03 }, // the only opacities the ink may take
  grain: { on: true, frequency: 0.8, strength: 0.5 }, // strength 0 to 1: how much of the ink the grain lets the paper through

  // ------------------------------------------------------------------- TASTE
  lines: {
    allowed: false, // false: no outline, axis, orbit or dashed guide. A mass says what a line would say (band, arc, beam). true: line(), orbit(), frame(), hull(), axes()
    arrows: false, // only when lines are allowed: arrow() and its head
    weight: 1, // stroke width, in the 200 x 200 frame
    opacity: 0.8,
    softOpacity: 0.4, // the `soft` option
    dash: "2 4",
  },
  motion: {
    hover: true, // a piece answers the hover with its verb (move(), no loop)
    loops: false, // true: a move can also run on a loop (move(h, "spin", { loop: 6 })), ambient, for a hero or a loader
    enter: 0.7, // seconds to reach the hover pose
    leave: 0.45, // seconds to come back
    ease: "cubic-bezier(.32,.72,0,1)",
  },
  variants: {
    count: 5, // how many compositions of one concept the variants mode draws, before the person picks one
    masses: 4, // masses a variant should stay under: they are sketches, kept minimal (a warning, not a refusal)
  },

  // ------------------------------------------------------------------ LIMITS
  limits: {
    masses: 10, // shapes in a piece
    glyphs: 1,
    hairlines: 8, // when lines are on
    moves: 3, // move() calls: one piece, one verb
    moving: 8, // parts that move
    gesture: 2, // seconds for the whole hover gesture, delays included
    duration: [0.25, 1.2], // seconds one part takes to reach its pose
    shift: 24, // units a part drifts
    scale: [0.8, 1.25], // how far a mass swells
    turn: 360, // degrees a part spins
    gradientSpan: 0.35, // the two ends of a paint should be at least this far apart in opacity, or it reads flat
    longSide: [60, 150], // units the masses span on their longer side
    margin: 16, // units masses keep from the frame
    edge: 6, // units the whole drawing keeps from the frame, at every moment of a hover
    centre: 16, // units the drawing's centre may stray from the middle
    settle: 0.5, // share of linear fades that should run downward (ink settles to the base)
    codeLines: 150, // lines of code in a piece
  },
};

// ------------------------------------------------------------ OVERRIDE
// `LUMEN_STYLE=/path/to/style.json` merges a json file over the values above, section by section, for one run:
// try a taste without editing this file, or keep a different style per project.
//   LUMEN_STYLE=lines-on.json node look.mjs piece.js        with { "lines": { "allowed": true } }
if (typeof process !== "undefined" && process.env && process.env.LUMEN_STYLE) {
  const { readFileSync } = await import("node:fs");
  const over = JSON.parse(readFileSync(process.env.LUMEN_STYLE, "utf8"));
  for (const [section, values] of Object.entries(over)) STYLE[section] = { ...STYLE[section], ...values };
}
