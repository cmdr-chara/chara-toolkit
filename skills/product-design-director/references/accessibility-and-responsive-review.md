# Accessibility and Responsive Review

Load when setting accessibility intent, reviewing a direction, or writing the responsive contract for a handoff.

Primary standards and patterns:

- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Understanding WCAG 2.2: https://www.w3.org/WAI/WCAG22/Understanding/
- WAI-ARIA Authoring Practices Guide: https://www.w3.org/WAI/ARIA/apg/
- Apple accessibility: https://developer.apple.com/accessibility/
- Android accessibility: https://developer.android.com/guide/topics/ui/accessibility

Validate exact conformance requirements for the project's jurisdiction and policy; this reference does not declare legal compliance. Default target when none is given: WCAG 2.2 Level AA, recorded as an assumption.

## Design acceptance prompts

- Reading order, visual order, semantics, and focus order agree.
- Every action has a visible label or an accessible name that matches its purpose; when a visible label exists, the accessible name contains it.
- Focus is visible and restored predictably after dialogs, navigation, errors, and dynamic updates.
- Hover, color, motion, and spatial position are not the only carriers of meaning.
- Text reflows under zoom/dynamic type; controls and content do not overlap or clip.
- Touch/pointer targets and spacing support the target platform and motor needs.
- Errors identify the field/problem, explain recovery, and preserve user input.
- Loading/status changes are exposed without causing disruptive announcements.
- Timeouts, auto-advance, animation, and parallax have pause/reduce/disable behavior where needed.
- Custom widgets follow an established platform/WAI pattern; otherwise use native controls.
- Responsive transformation preserves access to actions and context rather than hiding them.

## WCAG 2.2 criteria that most often change a design

These are design decisions, not implementation details; settle them in the spec.

| Criterion | Design implication |
| --- | --- |
| 1.4.3 / 1.4.11 Contrast | Verify every declared token pair: text 4.5:1 (large 3:1); UI boundaries, icons, and focus indicators 3:1 against adjacent colors. |
| 1.4.10 Reflow | Content works at 320 CSS px wide without two-dimensional scrolling, except data tables, maps, and similar content that needs it. |
| 1.4.4 / 1.4.12 Resize text and text spacing | Layouts survive 200% text and increased line/letter/word spacing; specify which roles wrap and which truncate with full text available. |
| 2.4.11 Focus Not Obscured (Minimum) | Sticky headers, footers, cookie bars, and chat launchers must not fully hide the focused element; define scroll padding or placement. |
| 2.5.7 Dragging Movements | Every drag (reorder, slider, map pan, kanban) has a single-pointer alternative such as buttons or a menu. |
| 2.5.8 Target Size (Minimum) | Pointer targets at least 24×24 CSS px or adequately spaced; platform guidance is larger (44pt iOS, 48dp Android) and should be the default for touch. |
| 3.2.6 Consistent Help | Help mechanisms (contact, chat, FAQ link) appear in the same relative place across pages that offer them. |
| 3.3.7 Redundant Entry | Do not make users re-enter information already provided in the same process; prefill or offer selection. |
| 3.3.8 Accessible Authentication (Minimum) | No cognitive-function test (memorizing, transcribing, puzzles) without an alternative; allow paste and password managers. |
| 2.2.2 Pause, Stop, Hide; 2.3.3 Animation from Interactions (AAA, recommended) | Auto-moving content can be paused; non-essential motion has reduced-motion behavior that honors the OS preference. |

## Responsive contract

Specify behavior per range rather than per device. Choose breakpoints where the content breaks, then name them.

| Region | Compact (<600) | Medium (600–1023) | Expanded (≥1024) | Notes |
| --- | --- | --- | --- | --- |
| Navigation | Bottom bar, 4 items + More | Rail | Persistent sidebar | Same destinations everywhere |
| Queue table | Stacked rows: title, status, due | Table, 4 columns | Table, 7 columns | Hidden columns reachable in row detail |
| Primary action | Sticky footer | Toolbar | Toolbar | Never only in overflow menu |

Rules:

- Name what reflows, what reprioritizes, what collapses into disclosure, and what is never hidden.
- Prefer container-relative behavior for components reused in different-width slots; the page grid is not the only context.
- Test widths between named breakpoints, not only at them; most layout bugs live at the edges.
- Cover landscape phones, split-screen tablets, 200% browser zoom on desktop, and the largest platform text size.
- Input modality is independent of width: a narrow window can have a mouse and keyboard, a wide tablet can be touch-only. Do not tie hover-only affordances to width.
- Long and localized content (30–40% expansion, right-to-left where supported) is part of every breakpoint check.

## Review method

1. Automated checks on representative screens (contrast, names, landmarks) to remove the easy failures.
2. Keyboard-only pass through every primary job: order, visibility, traps, skip links, shortcut conflicts.
3. Screen reader pass on at least one platform reader per target platform for primary jobs and dynamic states (loading, errors, toasts).
4. Zoom/text-size and reflow pass at the widths above.
5. Reduced-motion and high-contrast/forced-colors pass where the platform supports them.

Record each issue with criterion, severity, affected job, and the design change that resolves it. Resolve conflicts between brand expression and accessibility in favor of access, and document the decision.
