---
name: cinema-components
description: Create or refactor UI components using Tailwind v4 tokens, existing primitives, and project layouts.
invoked-by: both
tools:
  - read
  - search
---
# Cinema Components

## What This Skill Does
- Finds and reuses existing UI primitives (Input, loaders, modals, toast)
- Builds new components consistent with Tailwind tokens and CSS variables
- Integrates components into pages/layouts without inventing new design systems
- Keeps components small and extracts reusable pieces when they grow

## How to Use
Invocation: `/cinema-components <task>`

Example queries:
- `/cinema-components Find the shared Input component and show how it handles errors`
- `/cinema-components Create a reusable card component that uses theme tokens`
- `/cinema-components Where is the loader used for Suspense boundaries?`
- `/cinema-components Refactor a page to extract a reusable subcomponent`

## Instructions
1. Locate the closest existing primitive before creating a new one:
   - Inputs: [src/common/components/Input.tsx](src/common/components/Input.tsx)
   - Loaders: [src/common/components/GridLoader.tsx](src/common/components/GridLoader.tsx)
   - Toast: [src/common/components/Toast/ToastContext.tsx](src/common/components/Toast/ToastContext.tsx)
   - Modals: [src/common/components/Modals/ConfirmModal.tsx](src/common/components/Modals/ConfirmModal.tsx) and [src/common/components/Modals/InputModal.tsx](src/common/components/Modals/InputModal.tsx)
2. Use theme primitives:
   - Read [src/index.css](src/index.css) and use existing CSS variables via Tailwind arbitrary values.
3. Class composition:
   - Prefer [src/lib/utils.ts](src/lib/utils.ts) `cn()` when you have conditional classes.
4. Placement:
   - Shared components go in `src/common/components/`.
   - Feature-specific components go in `src/features/<domain>/components/`.
5. When changing UI behavior, scan for existing usage to avoid regressions.

## Key Files
- [src/index.css](src/index.css)
- [src/lib/utils.ts](src/lib/utils.ts)
- [src/common/components/Input.tsx](src/common/components/Input.tsx)
- [src/common/components/GridLoader.tsx](src/common/components/GridLoader.tsx)
- [src/common/components/Toast/ToastContext.tsx](src/common/components/Toast/ToastContext.tsx)

## Code Examples
### 1) Simple themed card (token-based)
```ts
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface CardProps {
  title: string
  className?: string
  children?: ReactNode
}

export function Card({ title, className, children }: CardProps) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-white/10 bg-[var(--bg-card)] p-6',
        className,
      )}
    >
      <h2 className='text-white font-bold tracking-tight'>{title}</h2>
      <div className='mt-4 text-[var(--text-muted)]'>{children}</div>
    </section>
  )
}
```

### 2) Reusing GridLoader for a local loading state
```ts
import { GridLoader } from '@/common/components/GridLoader'

export function InlineLoader() {
  return (
    <div className='flex items-center gap-2 text-[var(--text-muted)]'>
      <GridLoader className='h-4 w-4 animate-spin text-[var(--color-primary)]' />
      <span className='text-sm'>Завантаження…</span>
    </div>
  )
}
```

### 3) Toast usage in a button handler
```ts
import { useToast } from '@/common/components/Toast/ToastContext'

export function SaveButton() {
  const toast = useToast()

  const onClick = () => {
    toast.success('Збережено')
  }

  return (
    <button
      type='button'
      onClick={onClick}
      className='rounded-xl bg-[var(--color-primary)] px-4 py-2 text-white'
    >
      Save
    </button>
  )
}
```

## Output Format
Use this exact response structure:

```md
**Reuse Check**
- <what existing component(s) are relevant, with links>

**Implementation**
- <what component you will create/change>

**Files**
- [path/to/file](path/to/file) — <what changed>

**UX Notes**
- <tokens used, states handled (loading/error/empty)>
```

**Created**: 2026-05-05
**Skill version**: 1.0
