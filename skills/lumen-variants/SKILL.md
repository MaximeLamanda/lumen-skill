---
name: lumen-variants
description: Use when someone wants to see several options of one Lumen illustration before committing, or runs /lumen-variants with an idea. Draws five minimal compositions of one concept as stills on a numbered sheet, lets the person pick one (a number, or a number with an adjustment), then makes that one properly, hover and look included, on the kit of lumen-create.
argument-hint: "<idea>"
---

# Lumen: variants

The person has an idea and wants to see options before anything is finished. This skill draws five compositions of **one** concept, minimal (two or three masses, one core) and still, on one numbered sheet. The person picks a number, or a number with an adjustment ("2 mais plus grand", "2 avec le cœur du 4"), and only that one is made properly: its hover, the full look, the hand-over. The five differ by composition (where the core is, the view, the frame, what is hollow, what is repeated), never by decoration.

## What it needs

- One idea: a subject ("energy", "a solar panel", "security"). Optionally a concept to hold ("the battery"). Without one, the clearest concept is taken and named in one line before anything is drawn.
- Not several different objects: those are a set, and `/lumen-create` does sets. Not one piece straight away either: that is `/lumen-create` too.

## What to do

Invoke `/lumen-create` with the idea and, after it, the word "variantes", then whatever else the person said, in their words. Its step 1b does the rest: it fixes the concept, reads what the folder already holds, draws the sketches, builds the numbered sheet with `variants.mjs`, asks for the pick, and makes the chosen one as any other piece (steps 2 to 5). This skill is the door; the work, the kit and the rules stay in that one.

## What to say

When you show the sheet, say in one line per number what that composition does (its core, its view, its scale), and ask for a number, or a number with an adjustment. After the final piece, say that the other four stay in the folder as drafts and are not handed over.

If the person says that none fits, take what they say as a change and draw five again with it. It does not loop by itself.
