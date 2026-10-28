---
name: lumen-adopt
description: Use when someone has a drawing (an SVG or a picture of an icon, a logo, an illustration, a screenshot) and wants it redrawn in the Lumen style, or runs /lumen-adopt with a file. Reads the drawing, rebuilds its object from geometric primitives in one blue ink with gradients and grain, and no lines, on the kit of lumen-create.
argument-hint: "<file.svg|png|jpg|webp> [what to keep or change]"
---

# Lumen: adopt a drawing

The person has a drawing and wants it in the Lumen style. This skill reads the drawing, rebuilds its object from the kit's primitives, and restyles it: one blue ink, gradients that fade into the paper, fine grain, and no lines: what a line would say is said with a mass. It never recolours the drawing and it never traces it: the drawing gives the identity, and the piece is built new, with its proportions and its parts.

## What it needs

- One drawing: an `.svg` (the card is exact), or a `.png`, `.jpg` or `.webp` (read by eye). Given several, make one piece at a time and ask which comes first; keep the same kit so they form a set.
- Optionally, what to keep, drop or change. Without it, the concepts propose the core and what a ribbon or ghost says.

## What to do

Invoke `/lumen-create` with the file's path and, after it, whatever the person said, in their words. Its step 0 reads the drawing and fixes the object and its parts; its concepts then keep them and differ in the core, the direction of the fades and what a ribbon or ghost says. Everything after that, the build, the check and the hand-over, is that skill's.

## Motion

A drawing that is still comes back still. If the person wants it to move, or the object has an obvious verb (a rocket lifts, a bell rings), say what the verb would be in one line when you offer the concepts and let `/lumen-create` build it: one verb, one to three moves, the still always the rest pose. An animated source (a gif, a Lottie, an svg with animation) gives its *verb*, never its frames or its timing.

## What to say

When you offer the concepts, say first, in one line, what you read the drawing as and which of its parts you kept. If the person corrects the reading, read it again their way before any concept is built.

If the drawing is a mark that belongs to someone else, say so at hand-over: the piece shows another company's mark, and it is theirs to publish or not. A logo's name never goes inside the drawing (rule 10).

When several drawings are adopted in a row, finish with `node sheet.mjs lumen-*.svg` and say what you changed so they sit together: masses of a similar size, one gravity, one grain, no lines.
