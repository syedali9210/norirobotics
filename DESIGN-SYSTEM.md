# Nori design system

The rules behind norirobotics.com. Tokens live in `styles.css` under `:root`; components are the classes named below. Open `system.html` to see every token and component rendered.

## Principles

1. **The robot is the colour.** The page is near-white and quiet. Colour comes from Nori's films and photos, always inside a card. The page itself never turns green.
2. **One focal point per section.** Each section has one heading block and one visual. Anything else supports them.
3. **Say it once.** Every fact appears in one place. The text is Nori's own, word for word.
4. **Quiet type, loud work.** Headings are semibold at moderate sizes. A heading's second phrase is muted, so one sentence carries both the claim and the detail.
5. **Motion means something.** A film scrubs with scroll, the active task fills its timer as its video plays, words light up as you read. Nothing moves on its own just to decorate.

## Colour

| Token | Value | Use |
|---|---|---|
| `--paper` | `#fbfbfa` | Page background |
| `--surface` | `#f4f4f1` | Cards, cells, inputs |
| `--ink` | `#151518` | Headings, body, primary button |
| `--ink-2` | `#3c3c42` | Long body copy |
| `--muted` | `#6e6e73` | Secondary phrases, labels (4.9:1 on paper, 4.6:1 on surface) |
| `--line` | `rgba(21,21,24,.08)` | Hairlines and card borders |
| `--line-2` | `rgba(21,21,24,.16)` | Hover and outline buttons |
| `--green` | `#97bf3d` | Nori's mark. Decoration only: timer fills, status dots (2.1:1, never text) |
| `--green-ink` | `#4e7412` | Green as text or a thin line (5.3:1 on paper) |
| `--sage` | `#909874` | The film backdrop. Only inside the hero film card |
| `--yc` | `#f26522` | The YC mark, nowhere else |

Light only, like Nori's own site. No gradients on chrome, no glass, no glows.

## Type

Manrope for everything, JetBrains Mono for labels. Sizes are fluid between 390 and 1440.

| Role | Class | Size | Weight / leading / tracking |
|---|---|---|---|
| Hero title | `.t-hero` | 44 → 76 px | 600 / 1.02 / -0.04em |
| Section title | `h2` | 32 → 52 px | 600 / 1.08 / -0.035em |
| Statement | `.statement` | 28 → 52 px | 600 / 1.15 / -0.03em |
| Item title | `.t-item` | 20 → 24 px | 600 / 1.25 / -0.02em |
| Lead | `.lead` | 17 → 19 px | 500 / 1.5 / -0.01em |
| Body | `body` | 16 px | 400 / 1.6 |
| Small | `.t-small` | 14 px | 500 / 1.5 |
| Label | `.label` | 11 px mono | 500 / 1.4 / +0.12em, uppercase |

- A heading's muted second phrase is a `<span class="mute">` inside the same element.
- `text-wrap: balance` on headings, `pretty` on paragraphs. Reading measure 60ch at most.
- Numbers in specs use `font-variant-numeric: tabular-nums`.

## Space

Base unit 4. Scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.

| Token | Value | Use |
|---|---|---|
| `--gutter` | clamp(20px, 5vw, 80px) | Page side padding |
| `--max` | 1200px | Content width |
| `--section` | clamp(64px, 10vw, 128px) | Padding above and below a section |
| `--head` | clamp(32px, 4vw, 56px) | Section head to its content |
| card padding | 16px (media cards), 24–32px (text cards) | |
| grid gap | 12px (cards), 48px (columns) | |

## Shape and depth

- Radii: `--r-sm` 8px (media inside a card, small buttons), `--r` 14px (every card), `--r-pill` 999px (buttons, tabs).
- Cards are flat: `--surface` fill and a 1px `--line` border. Depth comes only from a lifted card on hover (`translateY(-2px)`) and from the hero film, which casts a soft shadow.
- One card style on the page.

## Motion

| Token | Value | Use |
|---|---|---|
| `--ease` | cubic-bezier(.23,1,.32,1) | Every UI response and entrance |
| `--ease-flow` | cubic-bezier(.22,1,.36,1) | Opening and closing (feature list) |
| `--t-ui` | 180ms | Press, hover, colour |
| `--t-open` | 560ms | Feature item opens, visual crossfade |
| `--t-in` | 700ms | Section content entering |

- Entrances: fade plus a 12px rise, siblings 60ms apart. Content is readable without JavaScript.
- Press: `scale(.97)`. Hover effects only under `(hover:hover) and (pointer:fine)`.
- Scroll-linked effects share one `requestAnimationFrame` loop and animate only transform, opacity and clip-path.
- Timers run linear because they show real time (a video playing).
- Reduced motion: no scrub, pin, rise or scale. The hero shows the whole robot; words show lit; videos wait for a click; fades of 300ms stay.

## Components

**Nav.** Paper bar, 60px. Mark and wordmark left, four section links centre, Order right. After the hero, `$1,688 · ships fall 2026` appears beside Order. Below 960px the links move into a menu.

**Button.** Pill, 44px tall (48px for `.btn--lg`), Manrope 600 15px.
- `.btn--ink`: the one primary action (Order).
- `.btn--line`: secondary, a 1px `--line-2` ring.
- A pair of buttons shares one width.

**Label.** Mono, 11px, uppercase, muted. Names a section above its title (`Everyday tasks`, `Hardware`).

**Section head.** Label, then a title with a muted second phrase. An action may sit at the right end on desktop. Left-aligned.

**Card.** `--surface`, 1px `--line`, radius 14. Media inside sits at 8px radius with a 6px inset.

**Feature switcher** (Everyday tasks). A list of items on the left, one visual on the right.
- The active item is ink and has a 2px green timer along its bottom edge that fills as its video plays. The others are muted.
- When a video ends, the next item opens. A click or the arrow keys choose an item; a pause button stops the timer.
- The visuals crossfade over 560ms.

**Trust cell.** A row of four cells (Y Combinator S26, NVIDIA Omniverse, Assembled in San Francisco, Open-source SDK), card style, Manrope 600 15px, centred. "Full price, no deposit" sits under the hero buttons instead, so it is said once.

**Spec row.** Mono label, a 32px figure, one line of detail. Rows sit beside the hairline drawing of Nori. Pointing at a part of the drawing lights the specs it carries.

**CTA card.** A plain card (no grid behind it: grid overlays were rejected before), centred title with the price as its second phrase in `--green-ink`, one primary button, then "Full price, no deposit" and the beta link.

## Responsive

Three tiers, as Bolto uses: **phone** below 768px, **tablet** 768–1023px, **desktop** from 1024px. Checked at 320, 360, 390, 768, 834, 1024 (portrait and landscape), 1440 and 1920.

| Section | Phone | Tablet | Desktop |
|---|---|---|---|
| Section spacing | 64px | about 80–100px | 128px |
| Hero | Title, buttons (a pair, equal widths, full row), film card at the film's own shape; scroll scrubs it as it passes | Same, film card 16:10 with feathered sides | Title left, buttons right; film card pins under the nav for 230vh while scroll scrubs it (landscape only) |
| Section head | Label, title, action stacked, left-aligned | Title left, action right | Same |
| Trust cells | 2 × 2 | 4 in a row | 4 in a row |
| Feature switcher | List first, its video below (as on Bolto) | List and video side by side | Same, wider gap |
| Card grid (3) | One column, 4:3 media, title on top | Two columns, the third centred at half width (as on Bolto) | Three columns, 4:5 media |
| Hardware bento | Head clip wide, arm and gripper side by side under it | Head tall on the left, two on the right | Same |
| Specs | Drawing card, then rows (two-up from 560px) | Drawing beside one column of rows | Drawing beside two columns of rows |
| Made here | 4:5 photo | 16:9 | 21:9 |
| Contact | Stacked | Two columns, top-aligned | Two columns, centred |
| Footer | Two link columns | Three | Brand left, three columns right |

- Card titles sit on top of their media, as on Bolto's product cards. A photo caption (the team) sits below.
- No horizontal scrolling at any width; touch targets 44px.

## Accessibility

- Text 4.5:1 or better, graphics 3:1 or better (checked by script).
- Every target 44px or more on touch. Visible focus: a 2px ink ring, 3px offset.
- Tabs are a real `tablist` with arrow keys. Looping videos pause on click; the task player has a labelled pause button.
- Section landmarks, one `h1`, headings in order, alt text on every photo.

## Do and don't

- Do keep the page near-white; put colour in cards.
- Do use the muted second phrase instead of a separate subtitle when the words form one sentence.
- Don't add a second accent colour, a gradient button, a glow, or a dark section.
- Don't invent copy, numbers or claims. If Nori's site doesn't say it, the page doesn't either.
