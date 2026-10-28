# AGENTS.md - Cinema Platform Frontend

This file is the working guide for AI coding agents in this repository.
Treat the repository itself as the source of truth. If this document and the
code disagree, inspect the code and update this document as part of the change.

## Project Snapshot

- Project: `cinema-platform-front`
- Type: Vite single-page app
- Language: React 19 + TypeScript
- Package manager: Bun is required
- Authoritative lockfile: `bun.lock`
- Deployment config: `vercel.json`
- Base branch: `main`; task branches may be checked out for development.

The app lets visitors browse cinema content and book seats, authenticated users
manage profile/loyalty/tickets, and admins manage cinema operations under
`/admin/*`.

## Package Manager

Bun is the required package manager for this project.

- Use `bun install` to install dependencies.
- Use `bun run <script>` for package scripts.
- Use `bun add <package>` for runtime dependencies.
- Use `bun add -d <package>` for development dependencies.
- Use `bunx <tool>` only when running a package executable that is not exposed
  through `package.json` scripts.
- Do not use `npm`, `npm run`, `npm install`, `npm pkg`, or `npx` in this repo.

There is a `package-lock.json` in the repository, but `bun.lock` is the Bun
lockfile and should be treated as authoritative.

## Commands

Scripts currently defined in `package.json`:

```bash
bun install
bun run dev
bun run build
bun run lint
bun run test
bun run format
bun run preview
```

Script meanings:

- `bun run dev`: start the Vite dev server.
- `bun run build`: run `tsc -b` and `vite build`.
- `bun run lint`: run `biome lint ./src`.
- `bun run format`: run `biome format --write ./src`.
- `bun run preview`: preview the production build.

`bun run test` uses Bun's built-in test runner for focused hall geometry,
seat availability, painting, save-flow, booking lock/reconciliation, and hub
lifecycle tests under `tests/`. Frontend CI runs the build and these tests.

## Runtime Configuration

The API base URL is resolved in `src/shared/api/apiUrl.ts`.

- `VITE_API_URL` is required by the frontend.
- It may be an `http(s)` URL or a relative path.
- If it is missing or invalid, startup/runtime code throws a clear error.
- `src/shared/api/axios.ts` creates the shared Axios client from this value.
- `src/features/booking/api/signalr.service.ts` derives the ticket hub URL by removing a
  trailing `/api` from `VITE_API_URL` and appending `/tickets`.
- Optional `VITE_TICKET_HUB_URL` overrides the hub URL. Set an absolute backend
  `/tickets` URL when using a relative API URL and the frontend host does not
  proxy the hub. Existing Vercel rewrites only proxy `/api/*`.

Example local environment:

```bash
VITE_API_URL=https://cinematestapi.runasp.net/api
```

`vercel.json` rewrites `/api/:path*` to
`https://cinemaplatformapi.dev/api/:path*`, so a relative `VITE_API_URL=/api`
is compatible with that deployment shape.

Environment files such as `.env` and `.env.production` are ignored by Git.
Never commit real secrets or local-only credentials.

## Current Stack

Versions are from `package.json`.

```yaml
runtime:
  packageManager: bun
  lockfile: bun.lock

language:
  typescript: ~5.9.3
  react: ^19.2.0

routing:
  react-router-dom: ^7.12.0

serverState:
  '@tanstack/react-query': ^5.90.20

forms:
  react-hook-form: ^7.71.1
  zod: ^4.3.5
  '@hookform/resolvers': ^5.2.2

http:
  axios: ^1.13.3

auth:
  jwt-decode: ^4.0.0

realtime:
  '@microsoft/signalr': ^10.0.0

ui:
  tailwindcss: ^4.1.18
  '@tailwindcss/vite': ^4.1.18
  lucide-react: ^0.562.0
  motion: ^12.34.0

charts:
  recharts: ^3.7.0

utilities:
  clsx: ^2.1.1
  tailwind-merge: ^3.4.0
  date-fns: ^4.1.0

tooling:
  vite: ^7.2.4
  '@vitejs/plugin-react': ^5.1.1
  '@biomejs/biome': 2.3.11
```

Biome is the configured lint and format tool.

## Repository Layout

The project uses a pragmatic Feature-Sliced Design layout. Place domain code in
the slice that owns it and keep generic infrastructure in `shared`.

```text
src/
  app/                  # Router, route layouts, startup UI, global style tokens
  pages/                # public/, auth/, account/, booking/, admin/ routes
  widgets/              # Composed home, movie-grid and static-page sections
  features/             # Auth, booking, loyalty, admin interactions, profile UI
  entities/             # Account, hall, movie, order, and session APIs/models
  shared/               # Generic UI, Axios, utilities and common types
  main.tsx              # React entry point and VITE_SHOW_WIP switch
  app/DevelopmentApp.tsx # Query, toast, auth, and router providers
```

Important architectural constraints:

- Keep route screens in `pages` and reusable composed sections in `widgets`.
- Keep user interactions in `features` and reusable domain APIs/models in `entities`.
  Generic hall and session reads live in their entity slices, not booking.
- Keep generic UI and infrastructure in `shared`; avoid global domain services and types.
- Dependencies flow from `app` through `pages`, `widgets`, `features`,
  `entities`, then `shared`. Reusable hall reads live in `entities/hall` and
  are used by both booking and admin editing. `shared/api` owns token storage,
  Axios interceptors, and refresh without importing the auth feature.
- Route pages compose UI. Shared generic UI belongs in `shared/ui`; domain
  display transforms belong in the owning entity's `lib`, and interaction
  components and logic belong in their feature's `ui`, `model`, or `lib`.
- Keep static user-facing copy and meaningful identifiers in nearby `config`
  files when they recur or obscure component intent. Preserve backend-derived
  values and existing business behavior when organizing copy.

## Routing

Routing uses `createBrowserRouter` and `RouterProvider`.

Public routes are children of `MainLayout`, including:

- `/`
- `/auth/login`
- `/auth/register`
- `/about`
- `/movies/:id`
- `/profile`
- `/faq`
- `/offers`
- `/booking/:id`
- `/sessions`
- `/bar`
- `/careers`
- `/technologies`
- `/halls`
- `/rules`
- `/privacy`
- `/offer`
- `/age-limits`
- `/account/loyalty`
- `/account/loyalty/history`
- `/profile/achievements`

Admin routes are children of `AdminRoute` and `AdminLayout`, including:

- `/admin`
- `/admin/halls`
- `/admin/sessions`
- `/admin/users`
- `/admin/loyalty`
- `/admin/achievements`
- `/admin/movies`
- `/admin/technologies`
- `/admin/user-activity`
- `/admin/pricings`
- `/admin/genres`

When adding routes, match the existing `React.lazy` route style in
`src/app/router.tsx`.

## Code Style

Biome is the configured formatter/linter for project scripts.

From `biome.json`:

- Indentation: spaces
- Line width: 80
- TypeScript/JavaScript quotes: single
- JSX quotes: single
- Semicolons: as needed
- Import organization: enabled through Biome assist
- CSS formatter/linter: disabled

TypeScript settings are strict in `tsconfig.app.json`.

The `@/*` path alias is configured in both `tsconfig.app.json` and
`vite.config.ts`. Use `@/` for cross-layer and cross-slice imports; use
relative imports within the same slice or local module.

Use `import type` for type-only imports.

## Existing Patterns

### API Calls

- Use the shared `api` instance from `src/shared/api/axios.ts`.
- Put domain services and types in the owning `entities` or `features` slice.
- Keep React Query hooks with their owning feature or entity; existing API-adjacent hooks may stay under `api`.
- Use stable query keys, typically prefixed by the domain name (e.g., `['movies', movieId]`).
- Booking checkout amounts come from `POST /orders/checkout-preview`. Do not
  calculate ticket totals, discounts, Gold/VIP upgrade amounts, loyalty
  discounts, or final payable amounts on the frontend.

### React Query

- `QueryClient` is configured in `src/app/DevelopmentApp.tsx`.
- Defaults: no refetch on window focus, one retry for most errors, and
  `staleTime` of five minutes.
- Use stable query keys.
- Include parameters that change a response in its domain-prefixed key.
- Invalidate affected query prefixes after mutations and preserve existing
  key values unless correcting stale data.
- Use `keepPreviousData` for paginated queries where the existing hooks do.
- Invalidate relevant queries after successful mutations.

### Auth

- Auth state is provided by `src/features/auth/model/AuthContext.tsx`.
- `authService` owns login, registration, JWT user mapping, and logout;
  `shared/api/tokenStorage.ts` keeps the existing localStorage keys.
- Axios refresh uses a separate client and one in-flight promise. A failed
  refresh clears credentials and updates the auth context.
- Access and refresh tokens are stored in localStorage by `authService`.
- Axios attaches `Authorization: Bearer <token>` when an access token exists.
- Axios attempts `/auth/refresh-token` on eligible `401` responses.
- `AdminRoute` permits users whose decoded role lowercases to `admin`.

### Booking SignalR

- `useBooking` owns the hub callback lifetime and cleans up on session change
  or unmount. The hub service serializes start/stop operations and rejoins the
  session group after reconnect.
- Initial join, reconnect, and seat events refresh the separate, user-specific
  `['session-seat-availability', normalizedSessionId, normalizedUserId]` query.
  `GET /sessions/{id}/seats` is authoritative for occupancy and lock ownership;
  hall details remain authoritative for full sparse geometry and maintenance.
- Occupancy reconciles every 10 seconds during selection/checkout, pauses when
  hidden/offline, and stops on completion. Failed or unverified ownership blocks
  checkout. Never free seats directly in response to an unlock notification.
- Explicit deselection unlocks the seat. Explicit session/back navigation releases
  this booking's newly acquired locks; pre-existing own locks and generic unmount
  use the backend TTL fallback because another tab may share user-scoped ownership.
  Successful orders retain backend-controlled reservation cleanup.

### Toasts

Use `useToast()` from
`src/shared/ui/toast/ToastContext.tsx` for user-visible success and
failure messages.

### Forms

Existing forms use React Hook Form and Zod. When editing or adding form code,
keep validation close to the form, infer form data from the Zod schema, use the
shared `Input` component where it fits, and show meaningful errors through
toasts or inline form errors.

### Styling

- Tailwind CSS v4 is wired through `@tailwindcss/vite`.
- Prefer theme variables from `src/app/styles/index.css`, such as `--bg-main`,
  `--bg-card`, `--text-main`, `--text-muted`, `--text-faint`, and
  `--color-primary`.
- Use `cn` from `src/shared/lib/utils.ts` when merging conditional classes.
- Lucide icons are already used in navigation and admin UI.
- Motion animations use the `motion` package, including `motion/react`.

### Empty States

- Use `src/shared/ui/EmptyState.tsx` for empty list, grid, table, and
  panel states after a successful request with no results.
- Use `src/shared/ui/UnavailableState.tsx` when a request fails. Pass a retry
  callback when the query exposes `refetch`; never show an empty-data message
  for a failed request.
- Component API: `icon`, `title`, `description`, optional `actionLabel`,
  optional `onAction`, and optional `className`.
- Pass an inline SVG icon element, usually a Lucide icon already available in
  the project, sized around `h-12 w-12`.
- Keep copy warm and context-specific: a short headline, then one or two
  sentences explaining what appears there and how to populate it.
- Use the existing tokens for empty-state styling: `--bg-card`,
  `--text-main`, `--text-muted`, `--text-faint`, `--color-primary`, and
  `--color-on-primary`.
- Empty states should be centered with generous vertical padding. In tables,
  render `EmptyState` inside the `td` and use `className='border-0
  bg-transparent ...'` so table structure remains valid.
- Add a primary action only when there is a clear next step, such as resetting a
  filter, browsing the schedule, or opening an admin create/import modal.

### Static Informational Pages

Static informational pages are standalone JSX components in `src/pages/public` and use
`src/widgets/static-page/ui/StaticPageLayout.tsx` for the shared shell. Do not reintroduce
`dangerouslySetInnerHTML` for local mock page content; convert content to typed
React components instead.

## Admin Work

When adding or editing admin functionality:

- Keep admin route pages under `src/pages/admin`.
- Keep admin-only components under `src/features/admin/ui`.
- Keep admin hooks under `src/features/admin/model`.
- Add admin routes only under the `/admin` branch in `src/app/router.tsx`.
- Add sidebar entries in `MENU_ITEMS` in `src/app/layouts/AdminLayout.tsx` only
  when the page should be navigable from the admin sidebar.
- Admin pages must remain protected by `AdminRoute`.

## Public Pages

Public route pages live in `src/pages/public`; authentication, account, and
booking route pages live in their matching `src/pages` directories. If a page needs feature-specific
components or hooks, place those under the matching `src/features/<domain>`
folder when that domain already exists.

If a public page should be linked globally, update the existing layout
navigation or footer components in `src/app/layouts/components`.

## Testing

`bun run test` runs focused tests with Bun's built-in runner and Node assertions.
`tests/tsconfig.json` inherits application aliases and adds Node types. No new
test dependency is required, so the dependency lockfile is unchanged.
There is no configured component or browser test runner.

`tests/accountPresentation.test.ts` covers admission QR eligibility, seat-to-ticket
associations, unchanged order grouping, account navigation markup and extracted
profile validation. Phase 7's disposable browser fixtures and screenshots live in
`docs/design/ui-experience-polish/`; they are not production imports.

`tests/inputAccessibility.test.ts` checks shared input markup with React's
server renderer; it does not verify DOM focus. The optional
`tests/accessibility.browser.mjs` function runs real Chromium keyboard and
viewport checks through Playwright's `browser_run_code` tool. Start
`bun run dev --host 127.0.0.1`, then pass the file contents as the tool's `code`
argument (or use `filename` if the tool can access the repository). It uses
disposable browser contexts and mocked API responses, including mutations.
No additional dependency or browser runner is installed.

Do not claim tests were run unless you add or run an actual configured command.
If test tooling is intentionally introduced, use Bun commands and update
`package.json`, the lockfile, and this document in the same change.

## Verification Before Handoff

For code changes, run the relevant configured Bun commands before concluding:

```bash
bun run lint
bun run build
bun run test
```

For documentation-only changes, `bun run lint` and `bun run build` are optional
unless the documentation change also affects code, config, scripts, or examples
that should be verified.

## Security Notes

- Do not introduce XSS vectors. Be especially careful around
  `dangerouslySetInnerHTML`.
- Do not commit `.env`, `.env.production`, or other local secret files.
- Keep auth token behavior consistent with `authService` unless the backend and
  frontend are intentionally changed together.
- Use the shared Axios error normalization instead of duplicating ad-hoc API
  error parsing in UI code.

## Current Repo Inconsistencies To Preserve Awareness Of

- `bun.lock` and `package-lock.json` are both present. Bun is required and
  `bun.lock` is authoritative, but the npm lockfile remains in the repo.
- Existing source imports are mixed between `@/` aliases and relative paths.

## Backend Compatibility

- Hall creation accepts optional sparse `seats` with absolute 1-based grid
  coordinates; omitting them still creates a rectangle for existing callers.
  `PUT /halls/{id}/layout` replaces geometry/types and returns 204. A
  `Hall.LayoutLocked` or `Hall.Inactive` conflict is authoritative; name and
  technology endpoints remain independent. Metadata-only saves retain the draft.
- Hall DTOs expose `totalCapacity` and persisted seats, without dimensions.
  Visible bounds come from maximum seat coordinates, preserving leading gaps.
  Trailing empty rows/columns cannot be recovered after reloading. Seat IDs,
  labels, numbers, and persistent statuses come from the backend; only `Active`
  seats absent from session occupancy may be selected.
- Legacy `POST /orders` returns a GUID string and currently receives a mock
  payment token. The frontend has not adopted the backend's reservation,
  checkout, and status endpoints. Do not change the payment flow in a refactor.
- Account tickets display `PaymentProcessing`, `PaymentOutcomeUnknown`, and
  `Expired` order states and `Reserved` and `Released` ticket states. QR disclosure
  retains the existing paid-order/valid-ticket rule and ticket-ID payload. History
  grouping does not introduce another admission rule; backend validation remains
  authoritative. Profile composition lives in `features/profile/ui`, and forms
  retain their React Hook Form/Zod schemas and existing mutation hooks.
- Loyalty profile and transaction DTOs match the .NET account endpoints.
  Benefits and the older loyalty checkout preview adapter remain placeholders;
  booking amounts come from `/orders/checkout-preview`.

---

Last updated: 2026-10-28
