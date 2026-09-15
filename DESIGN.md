# FantasyFootball design system

This document records the visual system implemented by the application. It is the source of truth for new UI work; user-facing copy should continue to describe the product in provider-neutral terms.

## Visual direction

The interface uses a deep navy stadium-like canvas, dark elevated surfaces, crisp white type, cool slate supporting text, and a restrained crimson accent. The existing Fantasy Football crest remains the primary hero artwork.

## Color tokens

| Role | Token | Value | Usage |
| --- | --- | --- | --- |
| App background | `background` | `#0B0C1D` | Page canvas and navigation |
| Deep background | `backgroundDeep` | `#0A0B1A` | Overlays and high-contrast framing |
| Alternate row | `rowAlt` | `#0E1022` | Zebra rows and recessed controls |
| Surface | `surface` | `#14162B` | Cards, panels, filters, and dialogs |
| Surface border | `surfaceBorder` | `#232742` | Low-emphasis boundaries |
| Accent | `accent` | `#FF3B56` | Active navigation, primary actions, and focus |
| Accent hover | `accentHover` | `#E62E45` | Hover and pressed states |
| Primary text | `text` | `#FFFFFF` | Headings and important values |
| Muted text | `textMuted` | `#A0A5C0` | Body copy and metadata |

Tokens are exported from `components/CSS/theme.js` and mirrored as CSS custom properties by `components/CSS/global-style.jsx`. Existing color aliases remain temporarily available for legacy components.

## Components and states

- Navigation links use rounded pills. The active route has a crimson fill and deep-navy text; inactive links use the navy background and gain a bordered surface on hover. The dark active text is intentional because small white text on `#FF3B56` does not meet the WCAG AA 4.5:1 threshold.
- Cards, panels, filter groups, dialogs, and status messages use the surface color, a one-pixel surface border, and rounded corners.
- Data tables use a crimson header, alternating `surface` and `rowAlt` rows, white values, and bordered cell divisions.
- Form controls use recessed dark backgrounds, white input text, slate placeholders, and rounded borders.
- Primary buttons use crimson with deep-navy text and transition to the darker crimson hover token with white text.

## Accessibility

- Every keyboard-interactive element receives a three-pixel crimson `:focus-visible` outline with separation from the element edge.
- The skip link uses a crimson fill and becomes visible on keyboard focus.
- Text and interactive states must retain WCAG 2.1 AA contrast. Measured contrast ratios for the core pairings are approximately 5.54:1 for deep navy on crimson, 7.96:1 for slate on navy, and 18.97:1 for white on navy. Do not use muted text for critical values or active controls.
- Existing route announcements, table-region labels, semantic headings, reduced-motion handling, and focus movement remain required behavior.

## Layout and responsive behavior

- Public content is constrained to 1200px with responsive horizontal padding.
- The fixed navigation collapses to the existing full-screen mobile menu below 900px.
- Card grids use responsive columns and collapse without horizontal page overflow.
- Tables remain inside keyboard-focusable horizontal scroll regions on narrow screens.
- The hero uses the existing crest image, centered with `cover`, and reserves a responsive minimum height to prevent layout movement.

## Governance

Use semantic tokens instead of introducing route-specific hex values. New components should support default, hover, focus-visible, disabled, loading, empty, error, and stale-data states as applicable. Visual changes must pass the repository test, lint, accessibility, and production-build checks before merge.
