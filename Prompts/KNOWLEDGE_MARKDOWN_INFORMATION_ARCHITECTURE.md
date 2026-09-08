# KNOWLEDGE FILE: MARKDOWN INFORMATION ARCHITECTURE

This file defines the semantic Markdown conventions expected by downstream systems.

## Core principle

Markdown is an intermediate representation between the source-understanding Gem and the downstream learning-interface generator.

Its priorities are:

1. semantic clarity
2. information completeness
3. hierarchy
4. predictable patterns
5. downstream parseability

It is NOT intended to contain UI instructions.

## Heading hierarchy

Use:

# Document title
## Major topic
### Subtopic
#### Fine-grained subsection

Do not skip heading levels without a reason.

Use headings to represent semantic hierarchy, not styling.

## Tables

Use Markdown tables when they improve:

- comparison
- classification
- structured findings
- drug attributes
- diagnostic criteria
- staging/grading
- differential diagnosis
- numerical information

Keep table columns semantically consistent.

Do not use a table simply because one exists in the source if prose is clearer.

## Lists

Use bullet lists for:

- features
- risk factors
- manifestations
- complications
- adverse effects
- indications
- contraindications
- examples

Use numbered lists for:

- sequential procedures
- diagnostic algorithms
- management sequences
- ordered mechanisms
- stepwise workflows

## Relationships

Prefer explicit structures such as:

Cause → Mechanism → Finding

or:

Finding → Differential → Discriminator

when the source itself establishes those relationships.

## Definitions

A definition should normally appear near the first meaningful occurrence of a concept.

Avoid repeating the same definition in multiple sections.

## Repeated information

When identical or nearly identical information occurs multiple times, consolidate it into the most logical location, while preserving any genuinely new detail from each occurrence.

Consolidation must reduce actual length, not just relocate the same amount of text — see the parent Gem instruction's compression rules.

## No importance labeling

Do not mark content as "high-yield," "low-yield," "must-know," "exam-relevant," or any equivalent tier, and do not use a "High-yield:" callout convention.

The Markdown is a comprehensive document meant to be studied in full. Adding an importance tier on top of it implies parts are safe to skip, which contradicts the document's purpose.

Semantic emphasis markers are still allowed, but only to preserve something the source itself explicitly flags — not to add a judgment of your own:

> **Clinical pearl:** ...

> **Important:** ...

> **Source-emphasized:** ... (use when the source itself visibly stresses a point, e.g. bolded/starred/repeated by the instructor)

Use these sparingly. They should not become clutter, and they must never be used to imply that unmarked content is less important.

## Unknown or unreadable material

Use concise transparency such as:

> **Source limitation:** The figure/table text is not sufficiently readable to extract reliably.

Do not fabricate the missing content.

## Images

Do not store images in the Markdown unless the surrounding system explicitly supports that.

Instead, represent reliably interpretable visual information as text, tables, or structured descriptions.

When interpretation is unreliable, explicitly state the limitation.

## No UI language

Do not add instructions such as:

- "put this in a card"
- "use a tab"
- "make this collapsible"
- "display this in a sidebar"
- "add a button"

The downstream system owns interface design.

## One source file = one logical unit

Each Markdown document produced from a single source file represents exactly one unit of content for the downstream system (it will become exactly one chapter). Do not structure the document as if it might be split into multiple independent top-level units — internal organization should use headings/subheadings, not implied top-level breaks.
