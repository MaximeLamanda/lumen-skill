# The look

The validator reads text, and the look's numbers read ink. This is what only eyes can check. Do it every time the piece changes.

## One command

From the person's working directory:

`node <skill folder>/look.mjs <name>.js [--source <file>] [--zoom] [--png]`

It draws the piece, validates it (printing every error and warning it finds), writes `lumen-<name>.svg`, measures the ink, and takes one sheet, `lumen-<name>-look.png`. If the validator finds an **error** it stops before opening a browser; warnings never stop it, they are for you to judge. It prints one line for each of items 9, 3, 2, 7 and 8 below, and, for a piece that moves, for items 14 and 15, measured on five frozen frames of the hover (or of one cycle of a loop). It exits 1 only when the validator finds an error or the ink would be cut by the frame, 2 when there is no browser, and 0 otherwise. `--strict` also stops on warnings.

- `--zoom` also writes the piece at 1200px, `lumen-<name>-zoom.png`, for what is too small on the sheet: the grain, a soft edge, where two fades meet.
- A piece that moves also gets, on the sheet, a **live** picture (hover it when you open the `.html`; frozen at rest in the `.png`) and a **strip of five frames** from rest to hover. It also writes `lumen-<name>-still.svg`, the rest pose alone.
- `--png` also writes `lumen-<name>.png`, 1024px on a transparent ground, for the person who wants a raster.
- `--source <file>` adds the drawing the piece was made from to the sheet, at the same size (`source.md`).

The browser is the Chrome, Chromium, Edge or Brave already on the machine, run headless; nothing is installed. `LUMEN_CHROME` names one explicitly.

## The pictures

All on pale paper unless said:

| Picture | What it is for |
| --- | --- |
| **rest** (360px, grain) | the piece as it ships |
| **bare** (360px, no grain) | the gradients alone: they must read without the grain |
| **frame** | the margins (pink) and the box the ink really covers (green) |
| **160px, 64px, 32px** | the sizes it will be used at: a card, a list, a tab |
| **on white** | the pale end of a fade may vanish on white: the shape must still read |
| **value study** | the piece in grey, no hue: the structure, the core and the light |
| **in a set** | the piece with its name in small capitals, as a set shows it |
| **live + 5 frames** | only for a piece that moves: the piece live (hover it), and five frozen frames of the hover gesture: rest, 25%, 50%, 75%, hover |

## What to see

Answer each with yes or no. A no is fixed in the piece before anything is handed over. `look.mjs` answers 9, 3, 2, 7 and 8 and says so; the rest are answered from the sheet. Zoom when a detail is too small to judge.

1. **The silhouette reads at 64px** (rule 09). From the 64px picture and the value study alone you can say what the object is. You know what you drew, so do not ask whether it looks like it: for each part, point in the 64px picture to the features you named for it in the concept (`concepts.md`, step 3). A part that shows none of them there is a no, however it looks at full size.
2. **One core** (rule 04). The eye starts in one place. `look.mjs` measures how much of the ink is at full density (2% to 55% is fine); you judge that it is one place, not two.
3. **Every mass fades** (rule 02). Nothing is flat; each shape dissolves into the paper on one side. `look.mjs` fails below 30% of the ink in a fade.
4. **The ink settles** (rule 03). Lighter above, deeper below; on a solid the top is lightest, the left deepest. No face is lit from the wrong side.
5. **Lines are quiet or absent** (rule 05). Lines are a setting, off by default. With them off, nothing in the piece reads as a line: no outline round a shape, no axis, no dashed guide, and a ribbon (`band`, `arc`) or a beam is a mass, wide enough to read as one (4 units or more) and softer than the main mass, never the darkest thing. With them on, they are one thin weight, behind the masses, each with a job. Either way, if you can take it out and lose nothing, take it out.
6. **Overlaps read as translucency** (rule 07). Where two masses cross, the colour deepens and both are still visible; nothing is hidden behind a flat cover.
7. **The grain is there and quiet** (rule 08). Visible at 360px, a whisper at 64px; the bare picture still reads. `look.mjs` measures how much the grain roughens the soft areas (warns below ×1.3).
8. **One ink** (rule 01). Nothing is grey, black or a second hue. `look.mjs` measures the share of solid pixels that are the ink or the paper. The value study has structure: not a flat patch.
9. **Nothing leaves the frame** (rule 09). `look.mjs` fails when the ink's box comes within 6 units of the edge, and says how much of the frame the ink covers (a warning under 8%: it will be lost in a thumbnail).
10. **No words** (rule 10). Nothing in the drawing is a letter, a digit or a logo; at most one glyph, and it belongs to the object.
11. **On white it still reads.** The 3% end of a fade vanishes on white; the shape must still be defined by its deep side.
12. **It belongs to its set.** Only when there are other pieces: `node <skill folder>/sheet.mjs lumen-*.svg` and look at the set. Same ink, same grain, same weight of line, masses of a similar size, the same gravity.
13. **Rest still reads as the source.** Only for a piece made from a drawing, with `--source`: side by side, a person who knows the drawing names the piece without being told. Check the proportions `source.md` said must survive, one by one; a part the source has and the piece lacks is a no, unless you called it decoration.

### When the piece moves

14. **Nothing leaves the frame, at any frame** (rule 14). `look.mjs` fails when, in any of the five frames, the ink comes within 6 units of the edge. In the strip, no part collides ugly with another, and the composition still holds at each extreme.
15. **The hover says the verb** (rules 11, 13). From the strip alone, left to right, you can say what the piece does when a hand comes to it: *speeds up, sends, opens, turns, sinks*. One verb: if you can say two, cut one. The last frame is a composition in its own right: the core is still there, nothing is lost or piled up. `look.mjs` measures how much of the ink moves at the most (a warning under 4%: it will not read; over 150%: everything moves, so the rest pose is lost). The gesture is calm: nothing bounces, and it lasts 2 seconds at most.
16. **Rest is the still** (rule 12). The first frame is the still piece, and `lumen-<name>-still.svg` stands alone: it reads at 64px, has its core, and is all a thumbnail, a slide or a viewer with reduced motion ever sees. Open the `.html` and hover it, then leave in the middle of the gesture: it comes back from where it is, without a jump.

If you are unsure whether the weight is right, build an example the same way and put the two side by side: `node <skill folder>/look.mjs <skill folder>/examples/layers.js`.

## Without a browser

Answer the same questions from the code, each with the line that makes it true: the paint of each mass for 2, 3 and 4, the `band`, `arc` and `beam` calls for 5, the coordinates for 9, the `move()` calls and their `dx`, `dy`, `to`, `by` for 14 and 15. Then say at hand-over, in these words, that the piece was **not looked at in a browser**. Do not skip the list and do not guess a yes.
