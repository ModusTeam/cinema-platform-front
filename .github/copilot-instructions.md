# Cinema Platform Frontend — Copilot Instructions
## Project overview
Cinema Platform is a React + TypeScript SPA: guests browse movies/sessions and book seats, authenticated users manage profile/orders, and admins manage catalog + operations under `/admin/*`. Backend API base URL is `VITE_API_URL` (preferred) or `http://localhost:5211/api`; production API is typically `https://cinematestapi.runasp.net/api`.
## Tech stack
- Framework: React 19 + Vite
- Language: TypeScript
- UI: TailwindCSS v4 + CSS variables in `src/index.css` (`lucide-react`, `motion`)
- Forms: React Hook Form + Zod (`@hookform/resolvers`)
- HTTP: Axios `api` in `src/lib/axios.ts` (auth + refresh)
- State: TanStack React Query v5
- Testing: not configured (add Vitest only if asked)
## Mandatory conventions
### Path aliases
✅ Use `@/` for cross-folder imports:
```ts
import { api } from '@/lib/axios'
import { useToast } from '@/common/components/Toast/ToastContext'
import type { User } from '@/types/auth'
```
❌ Avoid cross-domain relative imports:
```ts
import { api } from '../../lib/axios'
```
### Naming conventions
| Kind | Convention | Example |
|---|---|---|
| Components | `PascalCase.tsx` | `MovieCard.tsx` |
| Pages | `PascalCase.tsx` | `LoginPage.tsx` |
| Hooks | `useXxx.ts` | `useBooking.ts` |
| Services | `xxxService.ts` + `xxxService` | `moviesService` |
| Types | `src/types/*.ts` | `movie.ts` |
### Import order
1) React/Router  2) third-party  3) `@/`  4) `./`  5) `import type`
## Critical rules
✅ DO
- Use shared Axios `api` and React Query
- Use theme tokens via CSS variables (no new color palette)
- Surface user errors via `error.message` (Axios normalizes it)
❌ DON’T
- Don’t create new Axios instances / ad-hoc `fetch`
- Don’t change auth storage semantics or test runner unless asked
- Don’t use `any` except at integration boundaries
## Common patterns (copy-paste)
### 1) Authentication (via AuthContext)
```ts
import { useAuth } from '@/features/auth/AuthContext'

export function useRequireAuth() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  return { user, isAuthenticated, isLoading, logout }
}
```
### 2) Form with validation (RHF + Zod + shared Input)
```ts
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Input from '@/common/components/Input'
import { useToast } from '@/common/components/Toast/ToastContext'

const schema = z.object({
  firstName: z.string().min(1, "Введіть ім'я"),
  lastName: z.string().min(1, 'Введіть прізвище'),
})
type FormData = z.infer<typeof schema>

export function ProfileNameForm({ onSubmit }: { onSubmit: (d: FormData) => Promise<void> }) {
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const submit = async (data: FormData) => {
    setIsSubmitting(true)
    try { await onSubmit(data); toast.success('Збережено') }
    catch (e) { toast.error((e as Error).message) }
    finally { setIsSubmitting(false) }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className='space-y-4'>
      <Input label="Ім'я" error={errors.firstName?.message} {...register('firstName')} />
      <Input label='Прізвище' error={errors.lastName?.message} {...register('lastName')} />
      <button type='submit' disabled={isSubmitting} className='rounded-xl bg-[var(--color-primary)] px-4 py-3 text-white disabled:opacity-70'>Зберегти</button>
    </form>
  )
}
```
### 3) Error handling with toast (Axios-normalized message)
```ts
import { useToast } from '@/common/components/Toast/ToastContext'
import { accountService } from '@/services/accountService'

export async function updateProfileWithToast(toast: ReturnType<typeof useToast>, data: { firstName: string; lastName: string }) {
  try { await accountService.updateProfile(data); toast.success('Профіль оновлено') }
  catch (e) { toast.error((e as Error).message); throw e }
}
```
## Component structure template
```ts
import { useQuery } from '@tanstack/react-query'
import { useToast } from '@/common/components/Toast/ToastContext'
import { moviesService } from '@/services/moviesService'

export function MovieTitle({ movieId }: { movieId: string }) {
  const toast = useToast()
  const { data, isLoading, error } = useQuery({ queryKey: ['movie', movieId], queryFn: () => moviesService.getById(movieId), enabled: !!movieId })
  if (isLoading) return <div>Loading…</div>
  if (error) { toast.error((error as Error).message); return null }
  return <h1 className='text-white font-bold'>{data?.title ?? '—'}</h1>
}
```
## Testing requirements
Targets: 70/60/70/70 (statements/branches/functions/lines); name tests `*.test.ts` / `*.test.tsx`.
## Slash commands (skills)
/cinema-docs — docs + conventions
/cinema-structure — navigate codebase
/cinema-api — services/auth/fetching
/cinema-components — UI components
/cinema-forms — RHF + Zod
**Created**: 2026-05-05
**Skill version**: 1.0
