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
bun run format
bun run preview
```

Script meanings:

- `bun run dev`: start the Vite dev server.
- `bun run build`: run `tsc -b` and `vite build`.
- `bun run lint`: run `biome lint ./src`.
- `bun run format`: run `biome format --write ./src`.
- `bun run preview`: preview the production build.

There are currently no test scripts in `package.json`.

## Runtime Configuration

The API base URL is resolved in `src/shared/api/apiUrl.ts`.

- `VITE_API_URL` is required by the frontend.
- It may be an `http(s)` URL or a relative path.
- If it is missing or invalid, startup/runtime code throws a clear error.
- `src/shared/api/axios.ts` creates the shared Axios client from this value.
- `src/features/booking/api/signalr.service.ts` derives the ticket hub URL by removing a
  trailing `/api` from `VITE_API_URL` and appending `/tickets`.

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
  eslint: ^9.39.1
```

ESLint config is present, but the configured lint script uses Biome.

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
  App.tsx               # Unused Vite starter component, retained as-is
```

Important architectural constraints:

- Keep route screens in `pages` and reusable composed sections in `widgets`.
- Keep user interactions in `features` and reusable domain APIs/models in `entities`.
  Generic hall and session reads live in their entity slices, not booking.
- Keep generic UI and infrastructure in `shared`; avoid global domain services and types.
- Dependencies flow from `app` through `pages`, `widgets`, `features`,
  `entities`, then `shared`. Reusable hall reads live in `entities/hall` and
  are used by both booking and admin editing. `shared/api/axios.ts` still
  imports `features/auth/api/auth.service.ts`, which also imports the Axios
  client; this existing cycle and interceptor behavior are deferred to Phase 2.
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
- Use `keepPreviousData` for paginated queries where the existing hooks do.
- Invalidate relevant queries after successful mutations.

### Auth

- Auth state is provided by `src/features/auth/model/AuthContext.tsx`.
- Access and refresh tokens are stored in localStorage by `authService`.
- Axios attaches `Authorization: Bearer <token>` when an access token exists.
- Axios attempts `/auth/refresh-token` on eligible `401` responses.
- `AdminRoute` permits users whose decoded role lowercases to `admin`.

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

No unit, component, or end-to-end test tooling is currently configured:

- No `test` script exists in `package.json`.
- No Vitest, Jest, Playwright, Testing Library, or jsdom dependency exists in
  `package.json`.
- No test config files are present.

Do not claim tests were run unless you add or run an actual configured command.
If test tooling is intentionally introduced, use Bun commands and update
`package.json`, the lockfile, and this document in the same change.

## Verification Before Handoff

For code changes, run the relevant configured Bun commands before concluding:

```bash
bun run lint
bun run build
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
- `src/App.tsx` still contains starter/demo content and is not used by
  `src/main.tsx`.

---

Last updated: 2026-10-21
