# MEDICAL STUDY WEBAPP DESIGN SYSTEM

## Product feel

Premium, immersive, academic, calm, modern, information-rich, comfortable for long sessions.

Avoid generic dashboards, raw Markdown styling, marketing landing-page aesthetics, and toy-like UI.

## Desktop

Preferred structure:
- right-side navigation
- central reading area
- optional contextual controls

Use efficient wide-screen space without making text lines excessively long.

## Tablet

Reduce side chrome intelligently. Keep navigation and touch targets comfortable.

## Mobile

Use a navigation drawer/sheet or compact control. Keep reading surfaces full width. Avoid controls covering content.

The page itself must never scroll horizontally, at any width. See "Zero horizontal overflow" below.

## Zero horizontal overflow

This applies at every breakpoint, especially phone widths (320–430px):

- Every container uses `box-sizing: border-box`.
- No fixed-pixel-width element may exceed the viewport; prefer `%`, `vw` (capped), `min()`/`max()`/`clamp()`.
- Tables get their own scrollable wrapper (`overflow-x: auto` on the wrapper, not the page).
- Long strings (URLs, drug names, mixed-language terms) wrap instead of stretching their container.
- Decorative/animated background layers are sized and clipped so they cannot expand the scrollable area.
- `overflow-x: hidden` on the root is a safety net only — the underlying cause of any overflow must actually be fixed, not just hidden.

## Right-side navigation

Hierarchy:
Chapter
  Heading
    Subheading

Each chapter expands/collapses independently.

Use logical indentation and active-state highlighting.

## Mobile navigation drawer

- Width constrained to the viewport (e.g. `min(85vw, <max>)`) — never a fixed width that can exceed a narrow phone screen.
- Because the app is RTL, the drawer's open/close slide direction must be verified explicitly for RTL — it must slide in from the correct logical edge, not assume an LTR default.
- The drawer must be fully visible within the viewport in its open state; no portion should render off-screen.
- Internal scroll for long chapter lists; the page behind it must not grow or scroll horizontally while the drawer is open.
- Clear close control plus tap-outside-to-close, both reachable at every breakpoint.

## RTL

Use true directionality, not just alignment.

Use CSS logical properties and direction-aware icons.

Never use fixed LTR assumptions for:
- chevrons
- previous/next
- breadcrumbs
- nested indentation
- directional diagrams
- drawer slide direction

Mixed Persian/English medical content needs bidi-safe handling.

## Themes

Provide true Light and Dark themes using semantic design tokens.

Tokens should cover:
background, surface, elevated surface, primary text, secondary text, border, accent, success, warning, danger.

### Dark theme must be as rich as light theme

A dark theme that reads as "flat gray-on-black" is a failure state, not an acceptable minimal dark mode. Requirements:

- At least three distinguishable dark surface levels (base, surface, elevated) for visible depth.
- Ambient gradients/animated backgrounds stay visually present in dark mode — use deep, saturated hues (deep blue, violet, muted teal, warm dark accent) rather than desaturating everything to gray.
- Accent colors used for chapter markers, active states, and interactive elements keep their hue character in dark mode, adjusted only for contrast — they should not collapse into the same one or two neutral grays used for structure.
- Borders/separators are visible without being harsh.
- Primary text is a soft off-white rather than pure white, for comfortable long-session reading; secondary text keeps clearly lower but still legible contrast.

## Animated backgrounds

Use subtle animated gradient meshes, blurred orbs, ambient glows, or slow geometric movement.

Keep them behind readable surfaces and low contrast in both themes — reduced but not eliminated in dark mode (see Dark theme section).

Respect reduced motion.

Ensure these layers are sized/clipped so they can never cause horizontal overflow.

## Gradients

Use rich but coordinated gradients in:
- chapter headers
- title areas
- navigation accents
- section separators
- subtle surfaces
- interactive states

Avoid random rainbow styling. Keep gradients equally intentional in dark mode, not muted into near-invisibility.

## Fonts

User-selectable font family:
- Vazirmatn
- Shabnam
- Sahel

### Font size: continuous zoom, not discrete tiers

Do not offer named size tiers (Compact/Default/Large). Instead provide an increase (+) and decrease (−) control:

- Repeated presses step the base font size up/down by a small consistent increment.
- Enforce a minimum and maximum so layout never breaks.
- Size is driven by a root-level relative unit (CSS custom property / rem) so headings, body, tables, and navigation scale together.
- Give lightweight visual feedback of the current level.
- Persist both font-family and font-size preferences locally where practical.

## Reading ergonomics

Prioritize readable line length, strong hierarchy, adequate line height, clear tables, restrained emphasis, and comfortable spacing at every font-size step within the enforced range.

## Visual variation

Use meaningful variety:
- callouts
- comparison tables
- algorithms
- step blocks
- section accents
- expandable details
- navigation landmarks

Do not turn every paragraph into a card.

## Motion

Use subtle transitions for interaction, expansion, navigation, and theme changes.

No distracting perpetual motion.

## Long-document UX

For large libraries:
- hierarchical navigation
- search
- stable scroll position where practical
- direct anchors
- bookmarks/progress where useful
- compact navigation on mobile

## Accessibility

Semantic headings, keyboard support, visible focus, accessible labels, contrast, touch-friendly controls, reduced motion, no color-only semantics.
