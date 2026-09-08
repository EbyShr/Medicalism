# PERSISTENT MEDICAL STUDY WEBAPP QA

Run after initial build and after every new chapter addition.

## Content
[ ] New Markdown is a new top-level chapter — exactly one, never split, never auto-merged
[ ] Existing chapters preserved
[ ] All meaningful headings preserved
[ ] Lists/tables/comparisons preserved
[ ] Numbers/units/criteria preserved
[ ] No unsupported medical facts added
[ ] No high-yield/low-yield/importance labels added

## Navigation
[ ] Right-side navigation on desktop
[ ] Chapters expandable/collapsible
[ ] Headings nested under correct chapter
[ ] Active chapter/heading state
[ ] Direct anchor navigation
[ ] Mobile navigation exposes same hierarchy

## RTL
[ ] True RTL for Persian
[ ] Correct right-side hierarchy
[ ] Correct chevrons
[ ] Previous/next respects RTL
[ ] Mobile drawer slides in from the correct logical (RTL) edge
[ ] Mixed Persian/English remains readable
[ ] Numbers, units, abbreviations remain correct

## Themes
[ ] Light
[ ] Dark — has visible depth (3+ surface levels), not flat gray-on-black
[ ] Dark theme gradients/ambient backgrounds remain rich, not desaturated to gray
[ ] Tables/callouts/navigation work in both
[ ] Contrast remains strong in both themes

## Fonts
[ ] Vazirmatn / Shabnam / Sahel family switcher
[ ] Font fallback
[ ] Font size uses a continuous +/- zoom control (NOT 3 discrete tiers)
[ ] Font-size min/max enforced, layout never breaks at either extreme
[ ] Headings/body/tables/navigation all scale together with zoom
[ ] Preferences persist (family + size)

## Responsive
[ ] 320
[ ] 360
[ ] 390
[ ] 430
[ ] 768
[ ] 1024
[ ] 1440+
[ ] Zero horizontal page overflow at every listed width — verified by attempting to scroll/swipe sideways, not just visually
[ ] No element (including animated background layers) exceeds viewport width
[ ] Tables usable on phones via their own scroll container, page itself never scrolls sideways
[ ] Navigation drawer fully within viewport when open, at every width
[ ] Navigation adapts

## Interaction
[ ] Search indexes new chapter
[ ] Search result navigation
[ ] Expand/collapse
[ ] Theme toggle
[ ] Font-family switcher
[ ] Font-size +/- control
[ ] Bookmarks/progress/focus mode if implemented

## GitHub
[ ] Relative paths
[ ] Repository-subpath safe
[ ] Static hosting
[ ] No required backend
[ ] No secret keys

## Visual
[ ] Animated background is subtle
[ ] Gradients remain readable
[ ] Long scrolling has meaningful visual variation
[ ] UI remains academic and focused
