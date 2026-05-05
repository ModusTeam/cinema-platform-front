---
name: cinema-structure
description: Navigate the codebase by routing/layout/feature/service patterns and answer “where is X?” quickly.
invoked-by: both
tools:
  - read
  - search
---
# Cinema Structure

## What This Skill Does
- Locates routes, layouts, and feature entry points (public and `/admin/*`)
- Finds where UI navigation is wired (admin sidebar, header/footer links)
- Identifies where domain code lives (services, hooks, types, pages)
- Provides the shortest path to the correct file(s) with links

## How to Use
Invocation: `/cinema-structure <goal>`

Example queries:
- `/cinema-structure Where are routes for admin pages defined?`
- `/cinema-structure Where is the admin sidebar menu configured?`
- `/cinema-structure Find the seat-locking realtime integration entry point`
- `/cinema-structure Where should I add a new public page and link it?`

## Instructions
1. Routing:
   - Start at [src/app/router.tsx](src/app/router.tsx).
   - Public pages live under `src/pages/*` and mount under `MainLayout`.
   - Admin pages live under `src/features/admin/*` and mount under `AdminRoute` → `AdminLayout`.
2. Layouts:
   - Public shell: [src/layouts/MainLayout.tsx](src/layouts/MainLayout.tsx)
   - Admin shell + sidebar: [src/layouts/AdminLayout.tsx](src/layouts/AdminLayout.tsx)
3. Navigation wiring:
   - Admin sidebar items: `MENU_ITEMS` in [src/layouts/AdminLayout.tsx](src/layouts/AdminLayout.tsx)
   - Public header links: [src/layouts/components/Header.tsx](src/layouts/components/Header.tsx)
   - Footer links: [src/layouts/components/Footer.tsx](src/layouts/components/Footer.tsx)
4. Domain placement:
   - API calls: `src/services/*Service.ts`
   - React Query hooks: `src/features/<domain>/hooks/*`
   - Shared types: `src/types/*`
5. When you answer “where is X?”, include:
   - 1–3 direct file links,
   - the exact exported symbol name to search for,
   - and the next file to check after the first.

## Key Files
- [src/app/router.tsx](src/app/router.tsx)
- [src/layouts/MainLayout.tsx](src/layouts/MainLayout.tsx)
- [src/layouts/AdminLayout.tsx](src/layouts/AdminLayout.tsx)
- [src/layouts/components/Header.tsx](src/layouts/components/Header.tsx)
- [src/layouts/components/Footer.tsx](src/layouts/components/Footer.tsx)
- [src/features/auth/AdminRoute.tsx](src/features/auth/AdminRoute.tsx)

## Code Examples
### 1) Route entry (lazy-loaded page)
```ts
import { lazy } from 'react'

export const OffersPage = lazy(() => import('../pages/OffersPage'))
```

### 2) Router child route shape (React Router v7 data router)
```ts
import type { RouteObject } from 'react-router-dom'

export const publicRoutes: RouteObject[] = [
  { index: true, element: <div /> },
  { path: 'offers', element: <div /> },
]
```

### 3) Admin menu item type + example item
```ts
import { LayoutDashboard, type LucideIcon } from 'lucide-react'

export interface AdminMenuItem {
  icon: LucideIcon
  label: string
  href: string
}

export const MENU_ITEMS: AdminMenuItem[] = [
   { icon: LayoutDashboard, label: 'Дашборд', href: '/admin' },
]
```

## Output Format
Use this exact response structure:

```md
**Where To Look**
- [path/to/file](path/to/file) — <why>
- [path/to/file](path/to/file) — <why>

**How To Confirm**
1. <what string/symbol to search for>
2. <what behavior to verify>

**Next Action**
- <open/edit this file next>
```

**Created**: 2026-05-05
**Skill version**: 1.0
