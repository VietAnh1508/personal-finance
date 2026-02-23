# US-WEB-021: Refactor Web Color System For Theme Switching

## User Story
As a user,
I want consistent theming across web screens,
so that the app can support future light/dark theme switching without large UI rewrites.

## Acceptance Criteria
1. A centralized semantic color token layer exists for the web app (background, surface, text, accent, error, focus).
2. The token layer supports at least two theme sets (`dark` default and `light`) via CSS custom properties.
3. Shared UI primitives (page shell, cards, inputs, buttons, ghost/icon actions, menus, error states) use semantic classes based on the token layer.
4. Core web flows (`onboarding`, `transactions`, `settings`, `footer navigation`, and shared page components) no longer hardcode palette-specific Tailwind utility colors (`amber-*`, `slate-*`) in component class names.
5. Existing behavior and interaction logic stay unchanged; this story is visual-system refactoring only.
6. Existing relevant web tests continue passing after the refactor.

## Notes
- This story intentionally separates “theme system readiness” from “choosing a new palette”.
- Follow-up story will apply the final requested visual palette once semantic tokens are in place.
