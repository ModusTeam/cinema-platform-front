# AGENTS.md — Cinema Platform (Frontend)

This document is the single source of truth for AI coding agents working on **Cinema Platform**. Follow it exactly.

## Project Context

**Cinema Platform** is a React + TypeScript web application for a cinema business.

**Primary goals**

- Let visitors browse movies/sessions and book seats.
- Provide authenticated user features (profile, tickets/orders).
- Provide an admin area for managing halls, sessions, movies, technologies, genres, pricing rules, users, and user activity.

**Target users**

- **Guests**: browse content (home, movies, sessions, static info pages).
- **Authenticated users**: manage profile, view tickets/orders, book seats.
- **Admins**: manage catalog + operations in `/admin/*`.

**Backend API**

- Swagger: https://cinematestapi.runasp.net/swagger/index.html
- REST base URL (frontend config):
  - `VITE_API_URL` (preferred)
  - fallback: `http://localhost:5211/api` (see `src/lib/axios.ts`)

**Realtime**

- SignalR hub for ticket seat lock/unlock: derived from `VITE_API_URL` (see `src/services/signalrService.ts`).

## Tech Stack

```yaml
project:
  name: cinema-platform-front
  type: SPA

runtime:
  node:
    minimum: '>=18.18'
    recommended: '20 LTS'
  packageManager:
    primary: npm # `package-lock.json` is authoritative
    allowed: [npm, bun] # use Bun only if explicitly requested

language:
  typescript: '~5.9.3'
  react: '^19.2.0'

routing:
  react-router-dom: '^7.12.0' # data router + RouterProvider

state:
  react-query:
    package: '@tanstack/react-query'
    version: '^5.90.20'
    usage: 'server-state; queries, mutations, pagination; QueryClientProvider in src/main.tsx'

forms:
  react-hook-form: '^7.71.1'
  zod: '^4.3.5'
  resolvers: '@hookform/resolvers@^5.2.2' # zodResolver

http:
  axios: '^1.13.3' # configured in src/lib/axios.ts with auth + refresh interceptors

auth:
  jwt-decode: '^4.0.0'

realtime:
  signalr: '@microsoft/signalr@^10.0.0'

ui:
  tailwindcss: '^4.1.18'
  tailwind-vite-plugin: '@tailwindcss/vite@^4.1.18'
  icons: 'lucide-react@^0.562.0'
  motion: 'motion@^12.34.0' # animations

charts:
  recharts: '^3.7.0'

utilities:
  clsx: '^2.1.1'
  tailwind-merge: '^3.4.0'
  date-fns: '^4.1.0'

build:
  vite: '^7.2.4'
  react-plugin: '@vitejs/plugin-react@^5.1.1'

linting-formatting:
  biome: '2.3.11' # formatter + linter; quotes: single; semicolons: asNeeded
  eslint: '^9.39.1' # present; Biome is primary for lint/format scripts
  eslint-config:
    '@eslint/js': '^9.39.1'
    globals: '^16.5.0'
    'eslint-plugin-react-hooks': '^7.0.1'
    'eslint-plugin-react-refresh': '^0.4.24'
    'typescript-eslint': '^8.46.4'
  types:
    '@types/node': '^24.10.1'
    '@types/react': '^19.2.5'
    '@types/react-dom': '^19.2.3'

testing:
  status: 'not configured in this repo' # no vitest/jest deps or test scripts currently
```

## Environment Variables

Agents must not guess runtime configuration. Use `.env.local` (preferred) or `.env`.

```bash
# API (optional; falls back to http://localhost:5211/api)
VITE_API_URL=https://cinematestapi.runasp.net/api

```

Rules:

- Never commit real keys.

## File Structure

Annotated `src/` layout (authoritative):

```
src/
  app/
    router.tsx                # React Router v7 data router configuration

  common/
    components/
      AuroraText.tsx          # UI micro-component
      FlipWords.tsx           # UI micro-component
      GridLoader.tsx          # Loading spinner/loader
      Input.tsx               # Shared form input (forwardRef)
      ScrollToTop.tsx         # Router scroll restoration helper
      Modals/
        ConfirmModal.tsx      # Shared confirm modal
        InputModal.tsx        # Shared input modal
      Toast/
        ToastContext.tsx      # Toast provider + useToast() helper
        ToastContainer.tsx    # Toast UI rendering

  data/
    pagesContent.ts           # Static HTML content strings for StaticPage
    staticContent.ts          # FAQ and cinema bar menu data

  features/
    admin/
      *.tsx                   # Admin pages (route-level)
      components/             # Admin-only components/modals/editors
      hooks/                  # Admin React Query hooks + mutations
    auth/
      AuthContext.tsx         # AuthProvider + useAuth() (localStorage tokens)
      AdminRoute.tsx          # Route guard for /admin
      hooks/                  # Auth-related hooks (e.g. register)
    booking/
      components/             # Seat/session selectors
      hooks/useBooking.ts     # Booking flow + SignalR seat locks
    home/
      components/             # Home UI sections
      hooks/                  # Home data hooks
    movies/
      components/             # Movie list/details UI
      hooks/                  # Movie data hooks
    profile/
      components/             # Profile UI
      hooks/                  # Profile queries/mutations

  layouts/
    MainLayout.tsx            # Public layout + <Outlet/>
    AdminLayout.tsx           # Admin layout + <Outlet/>
    components/
      Header.tsx              # Site navigation
      Footer.tsx              # Footer links

  lib/
    axios.ts                  # Axios instance + interceptors + base URL
    utils.ts                  # cn() helper (clsx + tailwind-merge)

  pages/
    *.tsx                     # Public route pages (Home, Login, Movie, Static...)

  services/
    *Service.ts               # API client functions per domain (axios-based)
    signalrService.ts         # Ticket hub wrapper (seat locking)

  types/
    *.ts                      # Shared TypeScript types for API/domain

  index.css                   # Tailwind + CSS variables theme primitives
  main.tsx                    # App entry: QueryClientProvider, ToastProvider, AuthProvider, RouterProvider
  App.tsx                     # Vite starter leftover; app routing is driven by `src/app/router.tsx`
```

## Code Style & Conventions

### Formatting

- **Biome is the source of truth** for formatting.
- Use **single quotes** and **no semicolons** ("asNeeded").
- Keep lines around **80 chars** where practical.

### TypeScript patterns

- Prefer **explicit types** at module boundaries (service functions, hooks, context values).
- Props:
  - Use `interface` for exported props types.
  - Avoid `React.FC` unless you need `children` typing; prefer `const Component = (props: Props) => { ... }`.
- Event handlers: type them (e.g. `React.FormEvent`, `React.MouseEvent`) when non-trivial.
- Never use `any` except at integration boundaries; if unavoidable, immediately narrow/validate.

### Path aliases (REQUIRED)

- Use `@/` for imports rooted at `src/`.
- This repo is configured for it in TypeScript and Vite.

Examples:

```ts
import { api } from '@/lib/axios'
import type { Movie } from '@/types/movie'
import Input from '@/common/components/Input'
```

### Naming conventions

- Components: `PascalCase` (files and exported default)
  - Example: `MovieCard.tsx`, `AdminMoviesPage.tsx`
- Hooks: `useXxx` (file names and exported symbol)
  - Example: `useBooking.ts`, `useUsers.ts`
- Types:
  - Domain types in `src/types/*.ts`.
  - `type` for unions and helpers; `interface` for object shapes you extend.
- Constants:
  - Module-local constants: `UPPER_SNAKE_CASE` (`FILTERS`, `ACCESS_TOKEN_KEY`).
- Service objects:
  - `xxxService` with functions grouped by domain.

### Component structure template

Use this layout for new components/pages:

```tsx
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { cn } from '@/lib/utils'
import { useToast } from '@/common/components/Toast/ToastContext'
import { moviesService } from '@/services/moviesService'

interface Props {
	movieId: string
}

const ExampleComponent = ({ movieId }: Props) => {
	const toast = useToast()
	const [isOpen, setIsOpen] = useState(false)

	const { data, isLoading, error } = useQuery({
		queryKey: ['movie', movieId],
		queryFn: () => moviesService.getById(movieId),
		enabled: !!movieId,
	})

	const title = useMemo(() => data?.title ?? '—', [data])

	if (isLoading) return <div>Loading…</div>
	if (error) {
		toast.error((error as Error).message)
		return null
	}

	return (
		<div
			className={cn('rounded-xl border border-white/10', isOpen && 'ring-1')}
		>
			<h2 className='text-white font-bold'>{title}</h2>
		</div>
	)
}

export default ExampleComponent
```

### Import order rules

Even though Biome can organize imports, keep this order conceptually:

1. React / React Router imports
2. Third-party libraries (`@tanstack/react-query`, `zod`, `axios`, etc.)
3. Internal imports via alias `@/…`
4. Relative imports (`./…`) only when within the same folder
5. `type` imports grouped and marked with `import type`

## Common Patterns

All snippets below are real TypeScript and align with existing project patterns.

### Authentication flow (login + token usage)

- Tokens are stored in **localStorage** by `authService`.
- Axios attaches `Authorization: Bearer <token>` in a request interceptor.
- On `401`, Axios attempts refresh via `/auth/refresh-token` (see `src/lib/axios.ts`).

```ts
import { authService } from '@/services/authService'

export async function loginAndGetUser(email: string, password: string) {
	const user = await authService.login(email, password)
	return user
}
```

### Route protection (AdminRoute / PrivateRoute)

This repo ships `AdminRoute` for `/admin/*`.

If you need a **non-admin** guard, create `src/features/auth/PrivateRoute.tsx` using the same pattern:

```tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'

const PrivateRoute = () => {
	const { isAuthenticated, isLoading } = useAuth()
	const location = useLocation()

	if (isLoading) return null

	if (!isAuthenticated) {
		return (
			<Navigate to='/auth/login' replace state={{ from: location.pathname }} />
		)
	}

	return <Outlet />
}

export default PrivateRoute
```

### Forms with validation (React Hook Form + Zod)

Pattern used in `LoginPage`:

```tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import Input from '@/common/components/Input'
import { useToast } from '@/common/components/Toast/ToastContext'

const schema = z.object({
	email: z.string().email('Invalid email'),
	password: z.string().min(6, 'Min 6 chars'),
})

type FormData = z.infer<typeof schema>

const ExampleLoginForm = ({
	onSubmit,
}: {
	onSubmit: (d: FormData) => Promise<void>
}) => {
	const toast = useToast()
	const [isSubmitting, setIsSubmitting] = useState(false)

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({ resolver: zodResolver(schema) })

	const submit = async (data: FormData) => {
		setIsSubmitting(true)
		try {
			await onSubmit(data)
			toast.success('Logged in')
		} catch (e) {
			toast.error((e as Error).message)
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<form onSubmit={handleSubmit(submit)} className='space-y-4'>
			<Input
				label='Email'
				error={errors.email?.message}
				{...register('email')}
			/>
			<Input
				label='Password'
				type='password'
				error={errors.password?.message}
				{...register('password')}
			/>
			<button
				type='submit'
				disabled={isSubmitting}
				className='rounded-xl bg-[var(--color-primary)] px-4 py-3'
			>
				Submit
			</button>
		</form>
	)
}

export default ExampleLoginForm
```

### Data fetching (simple)

Use React Query with stable query keys and appropriate `enabled`:

```ts
import { useQuery } from '@tanstack/react-query'
import { moviesService } from '@/services/moviesService'

export const useMovie = (movieId?: string) => {
	return useQuery({
		queryKey: ['movie', movieId],
		queryFn: () => moviesService.getById(movieId!),
		enabled: !!movieId,
		staleTime: 10 * 60 * 1000,
	})
}
```

### Data fetching (paginated)

Follow the pattern used in `useUsers` with `keepPreviousData`:

```ts
import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { adminUsersService } from '@/services/adminUsersService'

export const usePaginatedUsers = () => {
	const [page, setPage] = useState(1)
	const pageSize = 10

	const query = useQuery({
		queryKey: ['admin-users', page],
		queryFn: () => adminUsersService.getAll(page, pageSize),
		placeholderData: keepPreviousData,
		staleTime: 5 * 60 * 1000,
	})

	return {
		...query,
		page,
		pageSize,
		setPage,
	}
}
```

### Toast notifications

Use `useToast()` from the Toast provider.

```ts
import { useToast } from '@/common/components/Toast/ToastContext'

export const ExampleToastButton = () => {
  const toast = useToast()

  return (
    <button
      type='button'
      className='rounded-xl border border-white/10 px-4 py-2'
      onClick={() => toast.success('Saved successfully')}
    >
      Save
    </button>
  )
}
```

### Internationalization (i18n)

No i18n library is installed currently. Content is mostly Ukrainian strings with some English.

If you need i18n **without adding a library**, use this minimal pattern.

Placement (REQUIRED): put this hook in `src/lib/i18n.ts` and import it as `@/lib/i18n`.

```ts
import { useMemo } from 'react'

type Locale = 'uk' | 'en'

type Messages = Record<string, string>

const MESSAGES: Record<Locale, Messages> = {
	uk: {
		login: 'Увійти',
		logout: 'Вийти',
	},
	en: {
		login: 'Log in',
		logout: 'Log out',
	},
}

export function useI18n(localeOverride?: Locale) {
	const locale: Locale = useMemo(() => {
		if (localeOverride) return localeOverride
		const lang = (navigator.language || 'uk').toLowerCase()
		return lang.startsWith('en') ? 'en' : 'uk'
	}, [localeOverride])

	const t = (key: string) => MESSAGES[locale][key] ?? key

	return { locale, t }
}
```

If you need a full solution (routing-based locale, ICU, etc.), add `react-i18next` and migrate in a separate PR.

## Workflows

Use these step-by-step checklists; do not improvise.

### Creating a new admin page

1. Create the page component in `src/features/admin/<NewPage>.tsx`.
2. Add a route under the `/admin` section in `src/app/router.tsx`.

- Use `lazy(() => import(...))` like existing routes.

3. If the page needs server data:
   - Add/extend a service in `src/services/*`.
   - Add a hook in `src/features/admin/hooks/useXxx.ts` using React Query.
4. Use `useToast()` for user-facing errors/success.
5. If the page should appear in the admin sidebar, add it to `MENU_ITEMS` in `src/layouts/AdminLayout.tsx`.
6. Verify role gating:
   - Admin pages must be reachable only under `/admin/*` (guarded by `AdminRoute`).
7. Run:
   - `npm run lint`
   - `npm run build`

### Creating a new public page

1. Create `src/pages/<NewPage>.tsx` (default export).
2. Add a route under the public `/` layout in `src/app/router.tsx`.

- Use `lazy(() => import(...))` like existing routes.

3. If it needs data:
   - Add a domain service function.
   - Add a feature hook under `src/features/<domain>/hooks`.
4. Use existing theme primitives from `src/index.css` (`--bg-main`, `--color-primary`, etc.).
5. If it should be linked from navigation, update `src/layouts/components/Header.tsx` (and/or footer links).
6. Run `npm run build` before handing off.

### Adding a new form

1. Define a Zod schema close to the form component.
2. Create a `type FormData = z.infer<typeof schema>`.
3. Use `useForm<FormData>({ resolver: zodResolver(schema) })`.
4. Use `src/common/components/Input` for inputs (forwardRef-friendly).
5. Submit:
   - Use `try/catch`.
   - On success: `toast.success(...)`.
   - On error: display `error.message` from Axios (it’s normalized by interceptor).
6. If the form hits the API:
   - Use `useMutation` with `onSuccess` invalidation.

### Adding a new API endpoint (frontend integration)

1. Identify the domain service file in `src/services/` (or create a new `xyzService.ts`).
2. Add a typed service function that calls `api` from `src/lib/axios.ts`.
3. Add/extend the domain type in `src/types/`.
4. Expose a hook using React Query:
   - Query: `useQuery({ queryKey, queryFn })`
   - Mutation: `useMutation({ mutationFn, onSuccess: invalidateQueries })`
5. Use stable query keys:
   - `['movie', id]`, `['admin-users', page]`, `['movie-sessions', movieId]`, etc.
6. Ensure errors are surfaced:
   - Let Axios interceptor normalize the message.
   - Use `useToast().error(...)` for user feedback.

## Testing Requirements

This repository currently has **no unit/component test tooling configured** (no Vitest/Jest scripts).

When adding tests, follow these requirements:

- Do not introduce a different test runner (Jest/Playwright) unless explicitly requested.
- Add **Vitest** + **@testing-library/react**.
- Coverage targets (initial):
  - **Statements**: 70%
  - **Branches**: 60%
  - **Functions**: 70%
  - **Lines**: 70%
- Required test types:
  - Unit tests for pure utilities and service helpers.
  - Component tests for complex UI (admin modals, booking selectors).

Setup checklist (when you are asked to add tests):

1. Install dependencies:

```bash
npm i -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

2. Add scripts (do not hand-edit if avoidable):

```bash
npm pkg set scripts.test="vitest" scripts.test:watch="vitest --watch" scripts.test:coverage="vitest run --coverage"
```

3. Add `vitest.config.ts`:

```ts
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'jsdom',
		setupFiles: ['./src/test/setup.ts'],
		globals: true,
	},
})
```

4. Add `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

5. Keep tests deterministic; avoid network calls (mock service modules, or mock Axios at the boundary).

Recommended commands once Vitest is added:

```bash
npm run test
npm run test:watch
npm run test:coverage
```

## Commands

Scripts from `package.json` (authoritative):

```bash
npm run dev       # start Vite dev server
npm run build     # typecheck (tsc -b) + Vite build
npm run preview   # preview production build
npm run lint      # biome lint ./src
npm run format    # biome format --write ./src
```

## Important Rules

✅ DO

- Use `@/` alias for all cross-folder imports under `src/`.
- Use `import type` for type-only imports.
- Use React Query for server state; invalidate queries on mutations.
- Use `useToast()` for user-visible success/failure.
- Wrap all async handlers in `try/catch` and show a meaningful error.
- Use theme primitives (CSS variables in `src/index.css`) instead of inventing new colors.
- Keep components small:
  - Aim for <200 lines per component; if it grows, extract subcomponents/hooks.

❌ DON’T

- Don’t bypass `src/lib/axios.ts` (no ad-hoc `fetch` / new axios instances).
- Don’t store tokens in React state only; auth must survive refresh (current design uses localStorage).
- Don’t use `dangerouslySetInnerHTML` with untrusted input.
- Don’t add global CSS rules outside `src/index.css` unless explicitly required.
- Don’t scatter duplicated helpers (prefer `cn` from `src/lib/utils.ts`).
- Don’t silence TypeScript errors with `any` or `as unknown as` except as a last resort.

## Security Guidelines

### JWT storage

- Current implementation stores access/refresh tokens in `localStorage` (see `src/services/authService.ts`).
- Be aware: localStorage is susceptible to XSS. Do not introduce XSS vectors.
- If you want to migrate to **HttpOnly cookies**, it requires backend support and is a separate initiative.

### XSS prevention (DOMPurify)

- `StaticPage` renders HTML from `src/data/pagesContent.ts` via `dangerouslySetInnerHTML`.
- Treat all HTML as untrusted by default.
- If content ever becomes user-generated or remotely sourced, **sanitize before render**.

Recommended implementation (requires adding `dompurify` dependency):

```bash
npm i dompurify

# Only if TypeScript complains about missing types
npm i -D @types/dompurify
```

```ts
import DOMPurify from 'dompurify'

export function sanitizeHtml(html: string) {
	return DOMPurify.sanitize(html, {
		USE_PROFILES: { html: true },
	})
}
```

Then:

```tsx
<div dangerouslySetInnerHTML={{ __html: sanitizeHtml(data.content) }} />
```

### Input validation

- Validate all form inputs with Zod.
- Validate server responses when needed (e.g., critical admin flows).

### Route guards

- Admin pages must remain under `AdminRoute`.
- Use a `PrivateRoute` (pattern above) for authenticated-only pages if added.

## Domain-Specific Terms

- **Movie**: a film entity shown in the cinema (metadata, poster, description).
- **Session**: a specific screening instance (movie + hall + startTime + pricing).
- **Hall**: a physical auditorium with rows/seats and supported technologies.
- **Seat**: a selectable seat in a hall.
- **Seat Type**: classification of a seat (e.g., standard/VIP) used for pricing.
- **Technology**: projection/sound format or seat motion (e.g., IMAX, Dolby Atmos, D-BOX).
- **Pricing / Pricing Rule**: dynamic rules that map (dayOfWeek, seatType) → price.
- **Occupied Seat IDs**: seat IDs currently taken or locked for a session.
- **Seat Lock**: temporary reservation broadcast via SignalR to prevent double booking.
- **Order**: a purchase intent/transaction created from selected seats.
- **Ticket**: proof of purchase for a session and seats.
- **Admin**: privileged role that can manage domain entities.

## Current Branch Context

- Active branch: `main`
- Working tree: modified (uncommitted changes in this workspace)
- Recent commits (most recent first):
  - `feat(#34): add Suspense boundary with GridLoader fallback to MainLayout and AdminLayout`
  - `perf(#34): implement code splitting via React.lazy for all page routes`
  - `feat: add external link to API documentation in Footer`
  - `docs: update README with official documentation link and description`
  - `refactor: remove navigation items from Header component`

Key areas recently touched:

- Routing/code-splitting (`src/app/router.tsx`)
- Layout loading states (`src/layouts/*`)

Key files currently changed (uncommitted):

- `AGENTS.md`
- `tsconfig.app.json` (adds `@/` path alias)
- `vite.config.ts` (adds `@` resolve alias)

## Dependencies & Tools (Usage Notes)

### React Router (v7)

- Uses `createBrowserRouter` + `RouterProvider`.
- Routes are defined in one place: `src/app/router.tsx`.
- Use lazy-loaded route components with `React.lazy`.

### TanStack React Query (v5)

- Global `QueryClient` is configured in `src/main.tsx`.
- Use `staleTime` for cache friendliness.
- For pagination, use `keepPreviousData`.
- In mutations, use `queryClient.invalidateQueries` on success.

### Axios (with auth + refresh)

- Use the shared `api` instance from `src/lib/axios.ts`.
- Error messages are normalized in the interceptor; prefer `error.message` in UI.

### SignalR

- Wrapper: `src/services/signalrService.ts`.
- Booking flow listens to `SeatLocked` / `SeatUnlocked` events and updates React Query cache.

### TailwindCSS v4 + theme primitives

- Theme colors and primitives are CSS variables in `src/index.css`.
- Prefer Tailwind classes plus `var(--token)` usage:
  - `bg-[var(--bg-main)]`, `text-[var(--text-muted)]`, etc.

### Motion

- Animations use `motion` (not Framer Motion).
- Keep animations subtle and avoid introducing new animation libraries.

### Recharts

- Use for admin analytics/stats. Keep chart components pure and feed typed data.

### Rich text editor / carousels / image cropping

These are **not currently in dependencies**.

- Rich text: today the app uses static HTML strings in `src/data/pagesContent.ts`.
  - If you add an editor, use **TipTap**: `@tiptap/react` + `@tiptap/starter-kit`.
  - Store output as HTML only if you can sanitize it. Otherwise store JSON and render via TipTap.
- Carousels: use **Embla**: `embla-carousel-react`.
  - Keep carousel state local; avoid adding global state for UI-only interactions.
- Image cropping: use **react-easy-crop**: `react-easy-crop`.
  - Crop on the client, upload the final image blob; validate file type/size before upload.

When introducing any of these, document the chosen package and add a usage example in this file.

## File References (Start Here)

Agents should read these files before making changes:

- `src/app/router.tsx` — all routes
- `src/main.tsx` — providers (React Query, Toast, Auth, Router)
- `src/features/auth/AuthContext.tsx` — auth state
- `src/features/auth/AdminRoute.tsx` — admin route guard
- `src/lib/axios.ts` — API base URL + interceptors
- `src/services/authService.ts` — token storage + refresh
- `src/services/signalrService.ts` — realtime seat locks
- `src/common/components/Toast/ToastContext.tsx` — notifications
- `src/index.css` — theme tokens
- `tsconfig.app.json` and `vite.config.ts` — alias + build settings

## Agent Behavior

1. Read the relevant files listed in **File References** before editing.
2. Analyze existing patterns; match them exactly (component style, hooks, error handling).
3. Use `@/` imports for any cross-folder import under `src/`.
4. Do not add new libraries unless necessary; prefer existing stack.
5. When adding API calls:
   - put them in `src/services/*`
   - type inputs/outputs in `src/types/*`
   - expose via a `useXxx` hook using React Query
6. Always handle async errors with `try/catch` and show toasts for user-facing failures.
7. When dealing with multilingual copy:
   - default to Ukrainian if unsure
   - keep strings consistent across the app
8. If you render any HTML:
   - sanitize it (DOMPurify) if it can be influenced externally
9. Run `npm run lint` and `npm run build` before concluding work.
10. If you introduce tests, make them deterministic and add coverage commands.

## Additional Resources

- README: `README.md`
- Backend Swagger: https://cinematestapi.runasp.net/swagger/index.html
- Vite docs: https://vite.dev/
- TanStack Query docs: https://tanstack.com/query/latest
- Motion docs: https://motion.dev/

---

Last Updated: 2026-05-05
Maintained By: Frontend Team (Cinema Platform)
