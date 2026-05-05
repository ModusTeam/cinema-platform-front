---
name: cinema-api
description: Implement or modify typed API services and React Query hooks using the shared Axios client and auth flow.
invoked-by: both
tools:
  - read
  - search
---
# Cinema API

## What This Skill Does
- Adds or updates typed service functions in `src/services/*Service.ts`
- Uses the shared Axios instance (auth header + refresh interceptor)
- Builds React Query hooks with stable query keys and invalidation
- Ensures user-facing errors surface via `error.message` (Axios interceptor)

## How to Use
Invocation: `/cinema-api <task>`

Example queries:
- `/cinema-api Add a new service function for GET /account/profile and a useProfile hook`
- `/cinema-api Why does my request not include Authorization header?`
- `/cinema-api Add a mutation and invalidate the right query keys`
- `/cinema-api Where is 401 refresh handling implemented?`

## Instructions
1. Confirm base behavior:
   - Read [src/lib/axios.ts](src/lib/axios.ts) to understand:
     - base URL selection (`VITE_API_URL` fallback)
     - auth header injection
     - 429 retry and 401 refresh flow
     - error message normalization (`error.message`)
2. For auth-related work, read:
   - [src/services/authService.ts](src/services/authService.ts)
   - [src/features/auth/AuthContext.tsx](src/features/auth/AuthContext.tsx)
3. Implement service functions:
   - Put network calls in `src/services/*` using `api`.
   - Type request/response DTOs (inline `interface` if local; `src/types/*` if shared).
   - Do not swallow errors in services unless you intentionally want a fallback value.
4. Add hooks:
   - Place hooks in `src/features/<domain>/hooks/`.
   - Use stable query keys (arrays) and `enabled` guards.
   - Mutations: invalidate affected queries on success.
5. UI error handling:
  - For queries: surface `error.message` in the UI consistently.
  - For mutations/handlers: wrap async actions in `try/catch` and display `((e as Error).message)`.

## Key Files
- [src/lib/axios.ts](src/lib/axios.ts)
- [src/services/authService.ts](src/services/authService.ts)
- [src/features/auth/AuthContext.tsx](src/features/auth/AuthContext.tsx)
- [src/services/accountService.ts](src/services/accountService.ts)
- [src/services/moviesService.ts](src/services/moviesService.ts)

## Code Examples
### 1) Typed service function pattern (throws on error)
```ts
import { api } from '@/lib/axios'

export interface UserProfileDto {
  id: string
  email: string
  firstName: string
  lastName: string
}

export async function getProfile(): Promise<UserProfileDto> {
  const { data } = await api.get<UserProfileDto>('/account/profile')
  return data
}
```

### 2) React Query hook with stable key + enabled
```ts
import { useQuery } from '@tanstack/react-query'
import { accountService } from '@/services/accountService'

export function useProfile(enabled: boolean) {
  return useQuery({
    queryKey: ['account-profile'],
    queryFn: () => accountService.getProfile(),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}
```

### 3) Mutation with invalidation
```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { accountService } from '@/services/accountService'
import type { UpdateProfileRequest } from '@/services/accountService'

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => accountService.updateProfile(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['account-profile'] })
    },
  })
}
```

## Output Format
Use this exact response structure:

```md
**Plan**
1. <service change>
2. <hook change>
3. <UI wiring + error handling>

**Edits**
- [path/to/file](path/to/file) — <what changed>
- [path/to/file](path/to/file) — <what changed>

**Query Keys / Invalidation**
- <list keys>

**Notes**
- <edge cases: enabled guards, nullability, error surfaces>
```

**Created**: 2026-05-05
**Skill version**: 1.0
