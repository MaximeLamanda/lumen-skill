# From an idea to a concept

A concept is four things: **a form**, **its parts**, **its core**, and **what its ribbon or ghost says** (when it needs one). A piece that moves adds a fifth: **its hover**, the one gesture that says the idea's verb when a hand comes to it. It fits on one line. If it does not, it is not ready to build.

## Finding it

1. **Find the idea's verb.** Not the noun. "Performance" is *speeding up*; "layers" is *stacking*; "clone" is *copying*; "sharing" is *spreading from one to many*; "conversion" is *narrowing*. The verb is what the form will do.
2. **Choose the register.** A *form* is a pure geometric body that carries the verb by structure: slices that grow, plates that stack, nodes that spread, a shape and its ghost. An *object* is a recognisable thing built from the same geometry: an envelope, a megaphone, a bell, a funnel. Pick the form when the idea is abstract (growth, depth, value). Pick the object when the idea has a thing everyone pictures (announcement, offer, report). Both are first-class: the references are about half forms and half objects, and the person decides which they want.
3. **Name the parts.** Two to five masses, each with a role. For an object, name for each part the two or three features that make it what it is, each something the real object has: a funnel is a wide rim, a narrowing cone, a thin neck. A part with none of them is a block, and a row of blocks is nothing in particular. Keep the list: you draw from it, and the look checks the 64px picture against it.
4. **Place the core.** Where does the ink gather? One place. Say where, and why: it is where the verb lands (the top plate, the deep corner of the step, the seal).
5. **Say what a line would have said, with a mass.** There are no lines (rule 05). A `band` or an `arc` for a path, a `beam` to link a core to what it feeds, a pale hollow mass for what is not there yet. If the piece loses nothing without it, leave it out: most need none.
6. **Choose the hover, when it moves.** The verb you found in step 1 is what the hand gets in answer: which of the three moves below says it? Name the parts that move, in what order, and what stays still (the core usually holds, or is what leads). One verb: a spin, a swell and a drift that mean three things are three ideas. The hover pose is a second composition, and it has to be as good as the rest.
7. **Check it will read at 64px, and at rest.** Few parts, big masses, one gradient direction. The still is pose A (rule 12), so it must work alone: a thumbnail, a slide and a reduced-motion viewer never see the hover.

## Seven forms already proven

The reference sets lean on a handful of forms. A new piece usually borrows one.

| Form | In the references | The verb | Typical build |
| --- | --- | --- | --- |
| **Stack** | Layers, Depth, Matrix | structure, hierarchy, accumulate | `box` or `cyl` repeated with a step, the top one deepest |
| **Orbit** | Evolve, Flow, Cycle | change, circulate, return | a glow disc, one or two `band` or `arc` ribbons round it |
| **Step** | Scale, Volume, Growth | grow, measure | nested squares or bell curves from one corner, on `axes` |
| **Offset copy** | Clone, Align, Update | duplicate, sync, refresh | a mass and its ghost: the same shape shifted, the ghost a pale hollow mass (`glow("air", "mid")`) |
| **Radiate** | Deploy, Sharing, Perspectives | spread, distribute | discs on tapered beams, one core at the middle |
| **Facet** | Value, Dimension | worth, depth, nest | a polyhedron from `poly` facets or a `box` inside a `hull` |
| **Object** | Message, Offer, Announcement, Report, Event | the thing itself | three to six primitives, one glyph at most |

## Five compositions of one concept (the variants mode)

When the person asks for variants, the concept stays the same and the **composition** changes. **Number 1 is the classic**: the composition you would have drawn without the mode, the one anyone pictures first (for a solar panel, six cells on a mast). It stays as it is, so the person can see what the other four deviate from, and it is not held to the minimal limit. The four others are sketches of 2 or 3 masses (4 at most) with one core, still, no hover. A variant that differs only by decoration is the same variant twice: a ribbon added, a gradient turned a few degrees, a part a tenth bigger do not count. Choose five from these axes, so that no two share both their core and their silhouette:

| Axis | What changes | For a battery |
| --- | --- | --- |
| **Core** | which part gathers the ink: the top, the base, one side, the middle | the charge deep at the base / the terminal deep at the top |
| **Masses** | how few say it | a body and its charge (2) / a body, a charge and a terminal (3) |
| **View** | flat from the front, or solid (`box`, `cyl`) | a rounded rectangle / a cylinder |
| **Frame** | the whole object, or the part that stands for it, cropped to fill the frame | the whole cell / only the charge and the terminal, big |
| **Hollow** | a full mass, or a pale hollow mass (a ghost) with a deep core inside | a filled body / a hollow body round a deep charge |
| **Repeat** | one, or the same part several times (a stack, a row, an offset copy) | one cell / three cells stacked, the top deepest |

Say each in a line, as in step 1 (parts and core): "3. Three cells stacked, the top one deepest." The sheet (`variants.mjs`) notes two variants that have the same number of masses and fill the same box: change one of them.

## Three moves

The kit has three moves, and one option that changes what they do: `fade`, the opacity a part goes to (so a part can dissolve as it moves). A verb is usually one of them, or two that agree.

| Move | What the part does on hover | The verb | In the references |
| --- | --- | --- | --- |
| **drift** | goes out by (dx, dy) | open, stack apart, lift, slide, sink | Layers' plates, Depth's discs, Matrix's cubes, Offer's card, Clone's copies |
| **drift + fade 0** | goes out and dissolves | send, emit, dispatch | Deploy's beams |
| **swell** | grows a little | grow, receive, pulse, wake | Scale's steps from their corner, Performance's lenses, Value's stone, Deploy's spheres |
| **spin** | turns by an angle about a pivot | circulate, change, swing, keep watch | Flow's rings (each its own angle), Evolve's orbits, Security's ring |

Two things make a hover read as one gesture: **a stagger** (`step`: each part starts a little after the last, so the gesture runs through the set, from where the verb starts) and **distinct durations** (`dur`: parts that do not arrive together, as Flow's rings do not). Keep every move small (rule 14): it is an answer, not an animation reel.

## Weak concepts

Drop it, or fix it before building, when:

- **It needs words.** Without a caption nobody would know what it is.
- **It is two ideas.** Two verbs, two cores, two objects.
- **It is a diagram.** Boxes and lines between them are not a form.
- **It is a literal icon drawn flat.** A padlock for security is a fine concept, half of the references are objects (an envelope, a megaphone, a bell, a funnel). What makes it weak is drawing it as flat clip-art: give it the gradient, a core, the features that make it that object, and a hover that does something only it would do. If the person wants a more abstract idea, offer the form as an alternative, not as a correction.
- **It has no core.** A grid of equal shapes is wallpaper.
- **It depends on a second colour.** There is one ink.
- **It will not read at 64px.** Too many parts, or parts too small.
- **It moves for the sake of moving.** A wobble on a piece whose idea is not a wobble. If the verb is not in the idea, leave the piece still.
- **Its hover says two things.** A spin and a swell and a drift with nothing to join them.

## An example

For "a sales funnel":

> **Sieve.** A form. Three rows of discs narrowing from wide to narrow, the last one deepest. The core is the last disc; a soft beam runs down through the rows.
>
> **Funnel.** An object. A cone narrowing to a neck, a wide pale rim on top with two small discs falling in, the neck deepest. The core is the neck; a pale beam falls from the rim to it.
>
> **Pinch.** A form. Two big pale curves closing in on a small deep disc between them; the core is the disc. The ghost is a pale hollow mass where the curves were.

Each has a form, parts and a core; each is one idea; each reads without a word. Their verbs, on hover: the sieve *narrows* (the rows swell in turn, widest first); the funnel *pours* (the discs drift down into the rim and dissolve); the pinch *closes* (the two curves drift together).
