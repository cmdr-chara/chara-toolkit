# Experience Model: Structure, States, Content, Hierarchy

Load when defining or reviewing flows, screens, states, copy, or density.

## Structure

- **Object model first.** List the nouns users manage (orders, projects, members) and the verbs on each. Navigation should follow objects and frequent verbs, not the org chart or database tables.
- **Journeys.** For each primary job, write the happy path as numbered steps, then mark every point where the user can be interrupted, blocked, or wrong. Those points generate the state matrix.
- **Entry points.** Account for deep links, notifications, search results, and returning mid-task, not only the home screen.
- **Progressive disclosure.** Hide by frequency, never by importance. A rare but consequential control (delete workspace) stays findable; a frequent low-stakes one (sort) stays one action away.

## State coverage matrix

Every screen or significant component gets a row. A blank cell is a design gap, not a builder decision.

| Surface | First use / empty | Loading | Partial / stale | Success | Error (recoverable) | Error (blocking) | No permission | Offline | Overflow / extreme |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Queue table | Explain value + primary action | Skeleton rows matching final layout | "Updated 5 min ago" + refresh | Rows | Inline retry, keep filters | Full-panel message + support path | Read-only rows, action hidden with reason | Cached rows, banner | 10k rows, 200-char names |

State rules:

- **Empty** distinguishes first use (teach and offer the first action), no results (show the query and how to broaden it), and cleared/done (confirm the good outcome).
- **Loading** preserves layout to avoid shift; show progress for anything likely over a few seconds; never block input that does not depend on the pending data.
- **Partial** covers some data failing, pagination, and optimistic updates awaiting confirmation; say what is missing rather than hiding it.
- **Errors** say what happened, whether data is safe, and what to do next, in that order. Keep user input. Distinguish user-fixable, retryable, and support-required.
- **Permission** states explain why an action is unavailable and who can grant it; prefer disabled-with-reason or visible-but-explained over silently removed when discoverability matters, and hidden when the existence of the object is itself sensitive.
- **Destructive actions** define confirmation weight by consequence: undo for reversible, typed confirmation for irreversible and high-impact.
- **Extreme content**: longest realistic strings, missing images, zero/one/many counts, right-to-left text, 30–40% text expansion for localization.

## Content design

Words are interface. Specify them; do not leave placeholders for builders to fill.

- Define voice in 3 rules with do/don't examples (for example: "Name the object, not the system: 'Invoice sent', not 'Operation successful'").
- Labels use the user's vocabulary from research or support tickets; record term decisions in a glossary so the same thing is never called two names.
- Buttons state the outcome as a verb + object ("Send invoice"), match the confirmation dialog title, and avoid generic "OK/Submit" when the action has consequences.
- Error messages: cause in plain language, no blame, a concrete next step, and no raw codes unless support needs them (then secondary).
- Helper text appears before the user errs for known constraints (format, length), not only after failure.
- Plan for truncation: specify which strings may truncate, where, and how the full value remains accessible.

## Density and hierarchy decisions

- Choose density from evidence: frequency of use, expertise, and whether the job is scan-and-act or read-and-decide. Record it as a decision; offer a user density setting only when evidence shows mixed populations on the same surface.
- Give each screen one primary focal point. Rank the rest as secondary, tertiary, and ignorable, and express ranks with at most three levers at once (size, weight, color/contrast, position, space). Using every lever for every rank produces noise.
- Group by proximity before adding borders or backgrounds; add containers only when proximity is insufficient.
- Align numbers right and tabular in data views; keep scannable columns left-aligned; put status where the eye lands first in a row.
- Primary actions sit where the job ends (bottom of a form, right of a toolbar per platform convention), not wherever there is space.
- Validate hierarchy with a squint or blur test and a five-second test: what users notice first must match the decision hierarchy from framing.
