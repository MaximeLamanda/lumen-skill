# The fifteen rules

They come from the reference sets: luminous geometric illustrations, one blue ink on pale lavender paper, masses that fade into the paper, fine grain, and **no lines at all**: what a line would say, a mass says. Rules 01 to 10 make the still piece. Rules 11 to 15 make it move, and apply only to a piece that calls `move()`. Each rule says what it asks, why, how to keep it with the kit, and when it goes wrong.

The kit enforces some of them by construction (01, 02, 08: it will not let you write a colour, a flat fill or an effect; 12 to 15: it writes the css, the clock and the trigger, and refuses a move that reaches too far). The validator reads the rest from the text and from what the kit says it drew. The look measures the ink, on the still and on five frames from rest to hover. Eyes judge what is left.

## How firm each rule is

Not every rule weighs the same, and the skill says which is which:

- **Identity** is what makes a piece Lumen, and the kit and the validator hold it: one ink on its paper (01), a gradient on every mass (02), the grain (08), the 200 × 200 frame with nothing cut (09), no words (10), css written only by the kit (15). A piece that breaks one is an **error**.
- **Taste** is what the person likes today, and it is a setting in `style.mjs`: lines on or off (05), arrows, loops or hover only (11, 13), how thin a line is, how much grain. Change the setting, not the pieces.
- **Readability** is a rule of thumb with a limit in `style.mjs`: how many parts (06), how big the masses (09), how far a part may drift (14), how long a gesture lasts (13), which way the ink settles (03). Going past one is a **warning**: the piece is still handed over, and you say why you kept it.

Where a rule below says "it goes wrong when", read it as a thing to look for, not as a ban.

## 01 · ink: one ink, one paper

Everything is the same blue (`#4553FE`) at some opacity over the same paper (`#F3F1FD`). No second hue, no black, no grey, no white. (`#3C46C0` is the blue of the captions on a sheet, never of a piece.)

- **Keep it:** the only colour you ever name is a level: `core`, `deep`, `mid`, `soft`, `mist`, `air`. A pale mark on a deep mass (a star on a seal) is the `paper` option of `glyph`.
- **It goes wrong when:** the piece writes a colour (`#...`, `rgb(...)`), a `fill` or a `stroke`; a second hue appears; the look's ink line says most solid pixels are not palette.

## 02 · fade: mass is gradient, never flat

Every filled shape is a gradient from ink to almost paper. The fade is what turns a shape into a volume, and what makes the edge dissolve on its pale side. There is no flat fill and no hard "half opacity".

- **Keep it:** every mass takes `fade(from, to[, angle])` or `glow(from, to[, cx, cy])` as its last argument. The two ends must be at least .35 apart (the kit throws below that). At least a third of the ink in the look should be mid-fade; the examples sit between 79% and 98%.
- **It goes wrong when:** a mass is flat or nearly so (`mist → soft`); the look says under 30% of the ink is in a fade; a "flat" look is made with a pile of near-identical fades.

## 03 · settle: ink settles to the base

By default a fade runs downward: light at the top, deeper below, as if the ink had sunk. On a solid the top face is the lightest, the left face the deepest, the right face between. The same everywhere in a set: one gravity, one light.

- **Keep it:** leave `angle` at its default (100) or stay within 45 to 135. `box` already tones its faces this way. A glow is exempt: it radiates from its own centre. A sideways or upward fade has to have a reason you can name (an edge that faces the core).
- **It goes wrong when:** most linear fades run sideways or upward (the validator's `settle`); one solid is lit from the other side than its neighbours.

## 04 · core: one place where the ink gathers

Every piece has one dense, saturated place, the core: the eye starts there and everything else dissolves away from it. A glow's centre, the deep corner of a step, the top plate of a stack, the seal on a card. Two competing cores are two ideas.

- **Keep it:** decide where the core is before drawing, and make it the only place that reaches `core`. Everything else tops out at `deep`.
- **It goes wrong when:** two separate masses are equally deep; there is no core (under 2% of the ink at full density in the look); the piece is so heavy the core does not stand out (over 55%).

## 05 · line: off by default, and what a mass says instead

Whether a piece has lines is a taste, and today it is off (`lines.allowed` in `style.mjs`): the person found the lines too strong, then did not want them at all. It can change again, which is why it is a setting and not a ban. While it is off, `line`, `orbit`, `frame`, `hull`, `axes` and `arrow` say so when called, and what a line would have said, a mass says, softly, with the same gradient and grain as everything else:

| A line would say | A mass says it with |
| --- | --- |
| a path, an orbit | `band` (an elliptical ribbon) or `arc` (an open ribbon with round ends), a few units wide, with a fade |
| a link, a ray | `beam`, a tapered beam from the core to what it feeds, fading to `air` at its far end |
| a ghost, what is not there yet | a pale hollow mass: `glow("air", "mid")` on a `rect`, `poly` or `disc`, deeper at its rim than at its heart. The ghost of a solid is **the same solid** (`box`, `cyl`) with hollow tones, painted at its own place in the depth order: a flat shape behind a solid reads as a sticker, not as part of the structure |
| a measure, an axis | nothing: let the rhythm of the masses measure (steps, plates), or leave it out |
| a direction | the order of the gesture (`step`), or where the core sits |

- **Keep it:** ask what the line was for. If the piece loses nothing without it, leave it out: most pieces need none. A ribbon or a beam is a mass: it has a gradient, a grain and a place in the order of depth, and it sits behind the main mass or fades into the paper.
- **When lines are on:** keep them a quiet second voice: one weight (the setting's), behind the masses, each with a job you can say in a word (a measure, a path, a ghost, a link), never an outline round every shape. Arrows are a further setting (`lines.arrows`).
- **It goes wrong when:** a ribbon is so thin it reads as a line again (keep it at 4 units wide or more); a ribbon or a beam is the darkest thing in the piece, so that it competes with the core; with lines on, every shape carries an outline, or the line competes with the masses.

## 06 · primitives: geometry only, few parts

A piece is built from discs, ovals, rings, rectangles, polygons, isometric boxes and cylinders, with `band`, `arc` and `beam` for what a line would have said, and `curve` for the odd silhouette. Two to five masses make most of the references; past ten is a warning. For an object, give each part the two or three features that make it what it is: an envelope has a V-shaped flap and a card rising from it; a megaphone a cone and a handle.

- **Keep it:** name the parts in the concept (`concepts.md`) and draw those, no more. Prefer `box` and `cyl` to hand-built solids.
- **It goes wrong when:** more than ten masses; a free-hand blob where a primitive would do; an object that is only a rounded block with nothing that gives it away.

## 07 · overlap: translucency is depth

Ink is translucent, so where two shapes overlap the colour deepens. That is how this style makes depth, and why a stack, a pair of offset squares or a clone of a shape read as layers. Paint back to front, in the order of the calls.

- **Keep it:** overlap parts by a tenth to two fifths of their size. Let the overlap show through.
- **It goes wrong when:** a shape is hidden behind a paper-coloured cover; a drop shadow, glow or blur stands in for depth; overlaps are too small to read or so large they merge into one mass.

## 08 · grain: grain on every mass, no other effect

The kit grains every mass with one fixed filter, so every piece of a set is grained alike. The grain speckles the ink's own opacity, so it shows where the fade is and fades itself into the paper on the pale side. Lines stay clean. Nothing else: no blur, no glow, no inner or drop shadow, no blend mode.

- **Keep it:** do nothing. The kit does it. Judge it on the 360px picture (visible) and the 64px one (quiet), and check the bare picture: the gradient has to read without the grain.
- **It goes wrong when:** the piece tries an effect of its own; the look says the grain is barely above the bare gradient; the piece only works with the grain on.

## 09 · frame: 200 × 200, centred, readable small

The viewBox is 200 × 200. The masses span 60 to 150 units on their longer side and keep 16 units from the edge, and the whole drawing keeps 6, at every moment of a hover. The drawing's centre is within 16 units of (100, 100). It reads as one object at 64px and as a value study in grey.

- **Keep it:** centre the masses, not the axes. Check the frame picture on the sheet: the ink's box (green) sits inside the margins (pink).
- **It goes wrong when:** the ink touches or leaves the frame; the piece is lost at 64px; the value study shows no structure (a flat grey patch).

## 10 · quiet: no words

Geometry carries the meaning. The name goes to the filename and to the caption of a set, never into the drawing. A single small glyph is allowed when the real object would carry it: the star on a seal, a play triangle on a video, a plus on a bell, a percent on a ticket, a check, three dots.

- **Keep it:** `glyph(kind, cx, cy, size)`, once, filled in ink (or `paper` on a deep mass). The glyphs are `star`, `dots` and `play`: each a filled mark, never a stroke.
- **It goes wrong when:** the drawing holds a letter, a digit or a logo; more than one glyph; the piece cannot be understood without its caption.

## 11 · verb: the hover answers with the piece's verb

A piece that moves answers the hand. On hover it does the verb of its idea: Performance speeds up, Deploy sends, Layers open, Flow turns, Security keeps watch. The hover is a gesture, not an effect, and it is part of the concept, as the core is (`concepts.md`, step 6). It does not decorate a still piece with a generic wobble.

- **Keep it:** name the verb in one word before writing `move()`. Three `move()` calls and eight moving parts are plenty (more is a warning): the still reads at a glance, and so must the hover. The hover pose is a second composition: look at the last frame of the strip, not only the first. Use `step` to stagger a stack so the gesture travels through it, from where the verb starts.
- **It goes wrong when:** the piece moves because moving was easy; two verbs compete (a spin, a swell and a drift that mean different things); a pile of moves and moving parts; the look says at most 4% of the ink moves (it will not read), or over 150% (everything moves, so the rest pose is lost); the hover pose is a mess (parts collide, the core is lost) or no different from rest.

## 12 · rest: rest is the still, and the hover comes back to it

The still piece is pose A: what a viewer sees at rest, with reduced motion, or when the hover is not available (an `<img>`, a slide, a thumbnail). It was designed (rules 04, 09) and the motion never replaces it. When the pointer leaves, every part returns exactly to it, from wherever it had got: the motion is a transition, so it can be interrupted at any moment and nothing jumps.

- **Keep it:** nothing to do: the kit moves between the two poses by transition. Judge the still first; add the hover after.
- **It goes wrong when:** the piece only works hovered (its still is flat, empty or unreadable).

## 13 · clock: one gesture, two clocks, no bounce

A discrete answer gets a long ease-out: a part takes .7s on `cubic-bezier(.32,.72,0,1)` to reach the hover pose (`dur`, .25 to 1.2), and .45s to come back, shorter on purpose: the hand has left. A gesture is meant to last 2 seconds at most, delays included, so order it with `step` or `delay` (30 to 120ms) until it reads as one. Nothing bounces or overshoots. By default a piece answers the hover and does not loop; a loop is a setting (`motion.loops`) for an ambient piece, a hero or a loader, and with it on `{ loop: seconds }` runs a move for ever (2 to 12 seconds a cycle): drift and swell go out and come back, spin turns. A loop starts and ends at rest, and stops under reduced motion.

- **Keep it:** leave the easing alone. Stagger from where the verb starts (the lit core, the nearest part), outward. Give parts their own `dur` when they should not arrive together (Flow's rings turn by three angles in three durations).
- **It goes wrong when:** a gesture much over 2 seconds (a warning); a stagger so long that the last part starts after the first has landed, so the gesture reads as a queue; a `dur` outside .25 to 1.2; a loop so fast it flickers or so slow it seems still.

## 14 · reach: clamp the reach

A move has a far end, and the piece is still composed there. A part never goes further than 24 units in x or in y, a mass swells to between .8 and 1.25 of its size, a spin turns at most a full circle, and at no moment of the gesture does the drawing leave the frame.

- **Keep it:** let the kit refuse (`drift` clamps at 24; `swell` between .8 and 1.25; `spin` at 360 degrees). It also sweeps every part's path and the validator rejects a piece whose swept box leaves the frame; the look measures five frames from rest to hover and fails if the ink comes within 6 units of the edge.
- **It goes wrong when:** at some frame the ink touches or leaves the frame; a mass is swept closer than 12 units to the edge; a move so large the piece comes apart (the look's `verb` says more than 150% of the ink moves).

## 15 · quiet motion: transform and opacity, a trigger that never moves

Motion is css on transform and opacity, by transition. It uses no script and no SMIL, and keyframes only for a move the person has put on a loop. It animates no gradient, filter or colour, so the ink stays the ink and the grain stays attached to the shape it grains. The trigger is the svg's own box, or an ancestor with the class `lm-host` (on hover and on keyboard focus): a box that never moves, so a part sliding out from under the pointer cannot make the hover flicker. It honours `prefers-reduced-motion`, and then the piece stays at rest.

- **Keep it:** do nothing. The kit writes one `<style>` block inside a `prefers-reduced-motion: no-preference` media query, and wraps a moving mass so its grain moves with it. Put `class="lm-host"` on the card or button that owns the hover when the icon should answer to it.
- **It goes wrong when:** the piece writes css, keyframes, a transform or an animation of its own; the page holds a script or an `<animate>` (errors).

## The frame

Not a rule of the study, but every piece shares it.

- The viewBox is `0 0 200 200`, transparent. The paper is drawn only by `--paper`, or by the page that shows the piece.
- Nothing is cut by the frame (an error). Masses usually span 60 to 150 units on their longer side and keep 16 from the edge, the whole drawing 6 (warnings, limits in `style.mjs`).
- A piece of more than 150 lines is often two ideas (a warning).
- The piece runs in a sandbox with `Math`, the kit and nothing else. It draws the same every time, so `Math.random` is off: `L.rand(seed)` is a seeded generator when a piece needs scatter.
- A piece that moves ships as one svg (`lumen-<name>.svg`) with its rest pose alone beside it (`lumen-<name>-still.svg`). To answer the hover it must be **inline** in the page (or opened as a page): an `<img>`, a background image or a slide cannot receive a hover and shows the rest pose. Put `class="lm-host"` on the card or button that should trigger it.
