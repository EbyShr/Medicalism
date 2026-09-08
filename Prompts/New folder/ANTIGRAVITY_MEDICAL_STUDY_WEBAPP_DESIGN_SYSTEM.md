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

## Right-side navigation

Hierarchy:
Chapter
  Heading
    Subheading

Each chapter expands/collapses independently.

Use logical indentation and active-state highlighting.

## RTL

Use true directionality, not just alignment.

Use CSS logical properties and direction-aware icons.

Never use fixed LTR assumptions for:
- chevrons
- previous/next
- breadcrumbs
- nested indentation
- directional diagrams

Mixed Persian/English medical content needs bidi-safe handling.

## Themes

Provide true Light and Dark themes using semantic design tokens.

Tokens should cover:
background, surface, elevated surface, primary text, secondary text, border, accent, success, warning, danger.

## Animated backgrounds

Use subtle animated gradient meshes, blurred orbs, ambient glows, or slow geometric movement.

Keep them behind readable surfaces and low contrast.

Respect reduced motion.

## Gradients

Use rich but coordinated gradients in:
- chapter headers
- title areas
- navigation accents
- section separators
- subtle surfaces
- interactive states

Avoid random rainbow styling.

## Fonts

User-selectable:
- Vazirmatn
- Shabnam
- Sahel

Also provide Compact / Default / Large text sizes.

Persist preferences locally where practical.

## Reading ergonomics

Prioritize readable line length, strong hierarchy, adequate line height, clear tables, restrained emphasis, and comfortable spacing.

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
