---
name: lumen-create
description: Use when someone asks for a new Lumen illustration, icon or visual, still or animated, or runs /lumen-create with an idea; with "variantes" or "variants" it draws five minimal compositions of one concept on a numbered sheet, lets the person pick one, then makes that one properly. Draws one luminous geometric piece in a single electric-blue ink on pale lavender paper, with gradients that dissolve into the paper, fine grain and hairline accents, on a fixed kit, and hands it over as a self-contained SVG, optionally with a css hover animation in which the piece answers the pointer with the verb of its idea.
argument-hint: "[idea] [variantes]"
---

# Lumen: create a piece

You are making one piece in the Lumen style: geometric solids and flat shapes in **one blue ink** that fade into pale paper, with **fine grain**, and, by default, **no lines**: what a line would say (a path, a link, a ghost) a ribbon, a beam or a pale hollow mass says (lines are a setting, see below). It ships as one SVG on a 200 × 200 frame, transparent, with nothing to install. It can also **answer the hover**: on hover (or keyboard focus on the card that holds it) the piece does the verb of its idea (speeds up, sends, opens, turns, sinks) and comes back when the hand leaves. It is a css transition between two designed poses, with no script and no loop, still when the viewer asks for reduced motion. The five examples in `examples/` are the bar, and each answers the hover: `evolve.js` (orbit), `layers.js` (stack), `scale.js` (step), `offer.js` (object), `clone.js` (offset copy).

Animate when the person asks for it, or when the idea is a verb that a still cannot show (send, open, turn). Otherwise a still is a complete piece: leave out `move()` and nothing below about motion applies. A piece answers the hover by default; an ambient loop is a setting (`motion.loops`), for a hero or a loader.

You write one thing: the piece. The kit (`kit.mjs`) is the mechanics: it draws, measures and writes the css, and it is what makes every piece of a set alike, so do not edit it or paste a changed copy of it. A piece names a level and calls a shape; it does not write a colour, a flat fill, a filter, an svg tag or a line of css, because the kit already does, the same way every time.

## Taste is a setting, not a law

What the person likes is not in the kit. It is in `style.mjs`, which is theirs: whether lines exist (`lines.allowed`, off by default), whether arrows exist (`lines.arrows`, off), whether a move can run on a loop (`motion.loops`, off: a piece answers the hover), how thin a line is, how much grain, and the limits of thumb that keep a piece readable. Their taste has changed more than once in this skill's life, so treat what they say as a setting, not as a prohibition to build into the kit:

- When they state a preference ("the lines are too strong", "no arrows", "I only want hovers"), ask once how far it goes: this piece, this set, or from now on. For this piece, draw it that way. For the set, change the value in `style.mjs` (one line, reversible) and run the look again. Never delete a capability from the kit, and never rewrite every piece, to honour a preference.
- When they say a part looks odd or badly placed ("bizarre", "pas bien"), that is a diagnosis to make, not an order to remove it: look at how it is built in the order of depth, its tones, its scale, how it overlaps its neighbours, and repair that. Offer the removal as the alternative, or show both, when you cannot tell. A part taken out when it only needed integrating costs a round trip and loses an idea they liked.
- Everything in `rules.md` is a reason, not a wall. The kit refuses only what cannot be drawn, and the validator stops a piece only for what would break it (an error); the rest is a warning with its limit in `style.mjs`. If a warning is worth ignoring, ignore it and say so.

Every file named below is in this skill's folder. The piece and its pictures are written in the person's working directory: run `build.mjs`, `validate.mjs`, `look.mjs` and `sheet.mjs` from there, by their path in this folder. Talk to the person in their own language; the code and the files stay as they are.

## 0. Source

Only when the request came with a drawing (an `.svg`, or a picture of an icon, a logo, an illustration). Run `node read.mjs <file>`: for an svg it writes the drawing as a picture and a card of what it measured, both in the working directory. Then read `source.md` and answer its questions. The object and its parts are now fixed: every concept in step 1 keeps them. (`lumen-adopt` sends you here.)

## 1. Concept

Read `concepts.md`. Then offer two or three concepts, one line each:

> **Name.** The form (or object). Its parts. Where the core is. What a ribbon or a ghost says, if it has one. (When it answers the hover: its verb, and the move that says it.)

When the brief is open (an idea, a feeling, "something for security"), wait for the person to pick. When it already names what to draw, or says to go ahead ("génère", a list of six words), do not make them choose: take the concept with the clearest core for each, say which you took in one line, and draw. For a set, agree the direction once at the start, not piece by piece. If there is nobody to ask, take the clearest and say so.

With a source (step 0), every concept keeps the object and its parts: they differ in the core, in the direction of the fades, in what a ribbon or ghost says, and in the hover.

One piece, one idea. A concept that needs a caption to be understood is not a concept yet.

## 1b. Variants (only when asked)

Skip this when the person did not ask for options. When they say "variantes", "variants", "explore", "plusieurs designs" or "5 options", or when `/lumen-variants` sends you here, do not draw one piece: draw several compositions of **one** concept, let them pick, then make the picked one properly. The count is `variants.count` in `style.mjs` (five).

1. **One concept.** Fix it as in step 1: form or object, parts, core. When the brief is open, take the clearest concept, say which in one line, and go on: they asked for variants of a concept, not for a choice between concepts. Several different objects are a set, not variants.
2. **Look at what exists first.** Read the person's folder (the working directory, and the gallery or set they name) for the same subject or a composition already drawn, and do not redraw it: that is how a "pulse" ended up redrawing a "target".
3. **Draw the sketches.** `variants.count` pieces, each in its own file (`<concept>-1.js` to `-5.js`, each with its own `name`), in the shape of step 2 but as stills: no `move()`, and 2 or 3 masses (4 at most, `variants.masses`), one core. They differ by **composition**, from the axes in `concepts.md` ("Five compositions"), never by decoration: a ribbon added, a gradient turned a few degrees, a part a tenth bigger are the same variant twice. No two share both their core and their silhouette.
4. **Make the sheet.** `node variants.mjs <concept>-1.js ... <concept>-5.js` validates each (an error stops it and says which number), then writes `lumen-variants.png`: the five numbered, with no names, each at 160px, 64px and as a value study. Fix errors, read warnings (`parts`, `alike`), and replace a variant that is too alike another rather than showing four. Judge the five at 64px (`look.md`, item 1). The full look is for the chosen one only; do not run it on the five.
5. **Show the sheet and ask.** Attach `lumen-variants.png`, one line per number saying what the composition does (its core, its view, its scale), and ask for a **number**, or a number with an adjustment ("2 mais plus grand", "2 avec le cœur du 4"). With nobody to ask, take the one with the clearest core, say which and why, and go on.
6. **Make the final piece.** The chosen variant, with its adjustment, becomes the piece: give it its real name, design its hover when the idea has a verb (step 2, point 5), then steps 3 and 4 as for any piece. The other four stay in the folder as drafts; say so, and do not hand them over as pieces. If the person answers that none fits, take what they say as a change (step 5) and draw the five again with it: the mode does not loop by itself.

## 2. Build

1. Read `rules.md`. The rules are not advice: a piece that breaks one is not finished. Rules 11 to 15 concern the hover, and apply only to a piece that calls `move()`.
2. Read the index at the top of `kit.mjs`: the comment down to `export const PAPER`. It lists everything you may call, including the hover: `move()`. Do not read the code under it.
3. Read the example nearer your concept: `examples/layers.js` for a stack or any solid, `examples/evolve.js` for a glow with orbits, `examples/scale.js` for flat steps on axes, `examples/offer.js` for an object.
4. Write the piece as `<name>.js` in the person's working directory, in the shape of the examples: no imports, a `draw(L)` that takes what it needs from `L`, and the file ends by calling `lumen({ name, means, draw })`.
   - `name`: it becomes the filename and the caption: lowercase letters, digits, `-` and `_`.
   - `means`: a sentence saying what the piece shows. It goes in the SVG's `<desc>` and is its alt text.
   - `rules`: optional, the numbers of the rules the piece leans on, for whoever reads it later.
   - `draw(L)`: back to front. Masses first (each ends with its paint), back to front. Coordinates are in the 200 × 200 frame; centre the masses near (100, 100). Every primitive returns a handle: keep the ones that will move.
5. When it answers the hover (read rules 11 to 15): usually no more than three `move(handles, kind, opts)` (more is a warning): `drift` (goes out by `dx`, `dy`), `swell` (grows to `to`) or `spin` (turns by `by` degrees), each with an optional `fade` (the opacity it goes to), `dur`, `delay` and `step` (a stagger). Decide the hover pose as a composition, as you decided the rest: the piece must be as good in its last frame as in its first. Design the still first, and add the hover after. Never write css, keyframes or a transform: the kit owns the clock, the easing and the trigger. With `motion.loops` on, `{ loop: seconds }` runs a move on a loop instead of on the hover.
6. Draw it: `node build.mjs <name>.js` writes `lumen-<name>.svg` (animated when it moves; `--still` for the rest pose alone), and so does each run of `look.mjs` in step 3.

## 3. Check

1. `node look.mjs <name>.js`, and `--source <file>` when there is one. It draws the piece, validates it, measures the ink, and takes the sheet `lumen-<name>-look.png`. For a piece that moves it also measures five frames from rest to hover (items 14 and 15) and adds a strip of them to the sheet. Fix every line it prints as failed, and run it again until it exits 0.
2. Read `look.md`, then the sheet, and answer its questions. Fix what fails, then go back to 1.
3. When the person asked for several pieces, or there are others in the folder: `node sheet.mjs lumen-*.svg` and judge the set (`look.md`, item 12). It writes a `.png` (every piece at rest) and an `.html` where each piece answers the hover live: give the person the `.html`. To show a hover where nothing can play one (a chat, a document), `node strip.mjs <piece.js> ...` writes a picture with one row per piece and five steps from rest to hover per column.

`look.mjs` uses the Chrome already on the machine; nothing is installed. Without one, check with `node validate.mjs <name>.js` after each change and do the look as `look.md` says under "Without a browser". Without Node, read the list of checks at the top of `validate.mjs` and answer each one from your code.

Fix every **error**: it means the piece cannot be drawn, would break the file or leaves the style's identity. Read every **warning** and decide: each is a rule of thumb with its limit in `style.mjs`, and a piece that goes past one on purpose is fine. Say which warnings you kept and why when you hand over. Do not say the look is done if you did not look.

## 4. Hand over

Show the person `lumen-<name>-look.png` (attach it or open it if you can) and give them `lumen-<name>.svg`. Add `--png` to the look for a transparent 1024px PNG if they need a raster. A piece that moves ships as `lumen-<name>.svg` (with the hover) and `lumen-<name>-still.svg` (the rest pose alone). **To answer the hover, the svg must be inline in the page** (paste its markup, or open the file as a page): an `<img>`, a CSS background or a slide cannot receive a hover and shows the rest pose. To trigger it from a card or a button, put `class="lm-host"` on that element. A png or a slide cannot hold the hover: say so if that is where it is going. Then say, one line each:

- the concept: what the form is, and where the core is;
- the rules it leans on;
- the ribbon, beam or ghost, if any: what it says;
- the hover, when it moves: the verb, which moves say it, and the order of the gesture;
- anything you could not verify (no Node, no browser), plainly. Frozen frames are not the hover playing: say whether you moved a pointer over it in a browser.

Then ask the person whether it reads as they imagined, and what to change. If there is nobody to ask, say it was not judged by them.

## 5. Adjust

When the person asks for a change, edit only `<name>.js`, then run `look.mjs` again and read the new sheet. The tenth version is held to the same bar as the first. A change of palette, grain, line weight, easing or limit is not a change to a piece: it is a value in `style.mjs`, shared by the whole set. Ask whether they mean this piece or the set (see "Taste is a setting"). A change of pace (faster, slower, calmer) is `dur`, `delay` and `step`, or smaller `dx`, `dy`, `to` and `by`.

## What goes wrong

| If you catch yourself | Do this instead |
| --- | --- |
| writing a colour, a `fill`, a `stroke` or an `opacity` | name a level: `core`, `deep`, `mid`, `soft`, `mist`, `air` (rules 01, 02) |
| making a mass flat because the gradient was fiddly | `fade(...)` or `glow(...)`, ends at least .35 apart (rule 02) |
| lighting one shape from the left and its neighbour from the right | one gravity: leave `angle` at its default, let `box` tone its faces (rule 03) |
| letting two masses both reach `core` | one core; everything else tops out at `deep` (rule 04) |
| the kit says "lines are off" when you reach for a line, an outline or an axis | that is the person's setting (`lines.allowed`): say it with `band`, `arc` or `beam`, a pale hollow mass for a ghost, or nothing; if they want lines, turn the setting on rather than working round it (rule 05) |
| hiding what is behind a shape with a flat cover | overlap, and let the ink deepen (rule 07) |
| reaching for a blur, a glow or a drop shadow | the grain and the overlap are the only depth there is (rules 07, 08) |
| adding a label, a number or a letter to the drawing | say it with geometry; the name goes to the filename (rule 10) |
| drawing a plain rounded block and calling it an object | give it the features that make it what it is, the ones you named in the concept (rule 06) |
| leaving the piece at 32px unreadable because it has twelve parts | two to five masses (rules 06, 09) |
| animating because the piece looks bare | the verb must be in the idea; if it is not, leave the piece still (rule 11) |
| reaching for an arrow while arrows are off | the order of the gesture (`step`), where the core sits, or ask whether arrows should be on (`lines.arrows`) |
| a ghost drawn as a flat shape behind a solid | build it as the same solid with hollow tones (`glow("air", "mid")` on the top, `fade("air", "mid")` on the sides), at its own place in the depth order (rule 05) |
| a ribbon so thin it reads as a line | 4 units wide or more, softer than the main mass, or take it out (rule 05) |
| writing css, keyframes or a transform | `move(handle, kind, opts)`: the kit owns the motion (rules 13, 15) |
| making everything move | at most three moves and eight parts; the core usually holds still or leads, and the rest answers it (rules 11, 12) |
| a bounce, an overshoot, or a gesture that drags | none exists in the kit: shorten with `dur`, `delay` and `step`, shrink the move (rules 13, 14). For an ambient loop, turn on `motion.loops` |
| a hover pose that is a mess | look at the last frame of the strip: parts must not pile up, and the core must still lead (rule 11) |
| giving the svg as an `<img>` and promising a hover | it shows the still: say it must be inline, with `class="lm-host"` on the card (rule 15) |
| trusting frozen frames as proof that it answers | open the page, move a pointer over it and leave mid-way, or say you did not |
| editing the kit to make something work | the piece is wrong; change the piece |
| letting in a second idea | cut it: one piece, one idea |
| five variants that differ only by decoration (a ribbon, a tilt, a size) | vary the composition: the core, the view, the frame, what is hollow, what is repeated (`concepts.md`) |
| five different objects when variants were asked | one concept, five compositions; several objects are a set (step 1) |
| designing a hover, or running the full look, on all five variants | the five are stills; the hover and the look are for the chosen one (step 1b) |
| redrawing a subject the folder or the gallery already holds | read what exists first (step 1b, point 2) |
| tracing a path from the source, or copying its colours | build the part from primitives with the proportions the card gives (`source.md`) |
| keeping a part of the source that is decoration | drop it: two or three parts make the object |
