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
- Current branch expected by this workspace: `main`

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

The API base URL is resolved in `src/lib/apiUrl.ts`.

- `VITE_API_URL` is required by the frontend.
- It may be an `http(s)` URL or a relative path.
- If it is missing or invalid, startup/runtime code throws a clear error.
- `src/lib/axios.ts` creates the shared Axios client from this value.
- `src/services/signalrService.ts` derives the ticket hub URL by removing a
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

```text
src/
  app/
    router.tsx

  common/
    components/
      AuroraText.tsx
      FlipWords.tsx
      GridLoader.tsx
      Input.tsx
      ScrollToTop.tsx
      Modals/
      Toast/

  constants/
    loyalty.ts

  data/
    bar.ts
    faq.ts

  features/
    account/
    admin/
    auth/
    booking/
    home/
    loyalty/
    movies/
    profile/

  layouts/
    MainLayout.tsx
    AdminLayout.tsx
    components/

  lib/
    apiUrl.ts
    axios.ts
    utils.ts

  pages/
    *.tsx

  services/
    *Service.ts
    signalrService.ts

  types/
    *.ts

  App.tsx
  index.css
  main.tsx
```

Important entry points:

- `src/main.tsx`: creates the React root and wraps the app in
  `QueryClientProvider`, `ToastProvider`, `AuthProvider`, and `RouterProvider`.
- `src/app/router.tsx`: defines all public and admin routes with
  `React.lazy`.
- `src/layouts/MainLayout.tsx` and `src/layouts/AdminLayout.tsx`: layout
  shells with `Suspense` fallbacks.
- `src/features/auth/AdminRoute.tsx`: admin-only route guard.
- `src/lib/axios.ts`: shared Axios instance, auth header, 429 retry, 401
  refresh flow, and normalized error messages.
- `src/services/authService.ts`: login/register/refresh and localStorage token
  persistence.
- `src/services/signalrService.ts`: ticket hub connection and seat lock events.
- `src/index.css`: Tailwind import plus theme tokens and global styles.

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
`vite.config.ts`. Existing code contains a mix of `@/` imports and relative
imports. For new cross-folder imports under `src`, prefer the configured `@/`
alias unless you are matching nearby relative imports in the same file.

Use `import type` for type-only imports.

## Existing Patterns

### API Calls

- Use the shared `api` instance from `src/lib/axios.ts`.
- Do not create a second Axios client for the main API.
- Service modules live in `src/services/*Service.ts` for most domains.
- Loyalty feature API code also exists under `src/features/loyalty/api`.
- Shared domain types live in `src/types/*` or feature-local `*.types.ts`
  files where that pattern already exists.

### React Query

- `QueryClient` is configured in `src/main.tsx`.
- Defaults: no refetch on window focus, one retry for most errors, and
  `staleTime` of five minutes.
- Use stable query keys.
- Use `keepPreviousData` for paginated queries where the existing hooks do.
- Invalidate relevant queries after successful mutations.

### Auth

- Auth state is provided by `src/features/auth/AuthContext.tsx`.
- Access and refresh tokens are stored in localStorage by `authService`.
- Axios attaches `Authorization: Bearer <token>` when an access token exists.
- Axios attempts `/auth/refresh-token` on eligible `401` responses.
- `AdminRoute` permits users whose decoded role lowercases to `admin`.

### Toasts

Use `useToast()` from
`src/common/components/Toast/ToastContext.tsx` for user-visible success and
failure messages.

### Forms

Existing forms use React Hook Form and Zod. When editing or adding form code,
keep validation close to the form, infer form data from the Zod schema, use the
shared `Input` component where it fits, and show meaningful errors through
toasts or inline form errors.

### Styling

- Tailwind CSS v4 is wired through `@tailwindcss/vite`.
- Prefer theme variables from `src/index.css`, such as `--bg-main`,
  `--bg-card`, `--text-main`, `--text-muted`, and `--color-primary`.
- Use `cn` from `src/lib/utils.ts` when merging conditional classes.
- Lucide icons are already used in navigation and admin UI.
- Motion animations use the `motion` package, including `motion/react`.

### Static Informational Pages

Static informational pages are standalone JSX components in `src/pages` and use
`src/layouts/StaticPageLayout.tsx` for the shared shell. Do not reintroduce
`dangerouslySetInnerHTML` for local mock page content; convert content to typed
React components instead.

## Admin Work

When adding or editing admin functionality:

- Keep admin pages under `src/features/admin`.
- Keep admin-only components under `src/features/admin/components`.
- Keep admin hooks under `src/features/admin/hooks`.
- Add admin routes only under the `/admin` branch in `src/app/router.tsx`.
- Add sidebar entries in `MENU_ITEMS` in `src/layouts/AdminLayout.tsx` only
  when the page should be navigable from the admin sidebar.
- Admin pages must remain protected by `AdminRoute`.

## Public Pages

Public route pages live in `src/pages`. If a public page needs feature-specific
components or hooks, place those under the matching `src/features/<domain>`
folder when that domain already exists.

If a public page should be linked globally, update the existing layout
navigation or footer components in `src/layouts/components`.

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
- README mentions `VITE_LOYALTY_API_URL`; current source code does not read that
  variable.
- Existing source imports are mixed between `@/` aliases and relative paths.
- `src/App.tsx` still contains starter/demo content and is not used by
  `src/main.tsx`.

---

Last updated: 2026-05-27
