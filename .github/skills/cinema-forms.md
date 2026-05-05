---
name: cinema-forms
description: Build forms with React Hook Form + Zod using the shared Input component and consistent validation UX.
invoked-by: both
tools:
  - read
  - search
---
# Cinema Forms

## What This Skill Does
- Creates validated forms with React Hook Form + Zod
- Reuses the shared Input component for consistent error rendering
- Ensures submission states are handled (disable buttons, show loader)
- Integrates API mutations with predictable success/error UX (inline)

## How to Use
Invocation: `/cinema-forms <task>`

Example queries:
- `/cinema-forms Create a register form with zodResolver and show inline errors`
- `/cinema-forms Add a change-password form and wire it to accountService.changePassword`
- `/cinema-forms Ensure a form shows server errors and disables submit while pending`
- `/cinema-forms Convert an uncontrolled form to React Hook Form`

## Instructions
1. Find an existing form for style and patterns:
   - Login form: [src/pages/LoginPage.tsx](src/pages/LoginPage.tsx)
   - Register form: [src/pages/RegisterPage.tsx](src/pages/RegisterPage.tsx)
2. Validation:
   - Define a Zod schema close to the form.
   - Derive `type FormData = z.infer<typeof schema>`.
3. React Hook Form:
   - Use `useForm<FormData>({ resolver: zodResolver(schema) })`.
   - Pass `errors.<field>?.message` into the shared Input.
4. Submission UX:
   - Track a submitting flag and disable the submit button.
   - Prefer consistent Ukrainian copy for validation messages.
5. Server errors:
   - For auth/login style flows, inline error text is acceptable.
  - For profile/admin edits, keep error messages consistent and user-facing.

## Key Files
- [src/common/components/Input.tsx](src/common/components/Input.tsx)
- [src/pages/LoginPage.tsx](src/pages/LoginPage.tsx)
- [src/pages/RegisterPage.tsx](src/pages/RegisterPage.tsx)
- [src/common/components/Toast/ToastContext.tsx](src/common/components/Toast/ToastContext.tsx)
- [src/services/accountService.ts](src/services/accountService.ts)

## Code Examples
### 1) Minimal Zod schema + inferred type
```ts
import * as z from 'zod'

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(6, 'Введіть старий пароль'),
    newPassword: z.string().min(6, 'Пароль має бути мінімум 6 символів'),
    confirmNewPassword: z.string().min(6, 'Повторіть новий пароль'),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'Паролі не співпадають',
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
```

### 2) Form component (RHF + shared Input + inline server error)
```ts
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import Input from '@/common/components/Input'
import { accountService } from '@/services/accountService'

const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(6, 'Введіть старий пароль'),
    newPassword: z.string().min(6, 'Пароль має бути мінімум 6 символів'),
    confirmNewPassword: z.string().min(6, 'Повторіть новий пароль'),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    path: ['confirmNewPassword'],
    message: 'Паролі не співпадають',
  })

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export function ChangePasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  const submit = async (data: ChangePasswordFormData) => {
    setIsSubmitting(true)
    setServerError(null)
    try {
      await accountService.changePassword(data)
    } catch (e) {
      setServerError((e as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className='space-y-4'>
      {serverError && (
        <div className='rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-500'>
          {serverError}
        </div>
      )}

      <Input
        label='Старий пароль'
        type='password'
        error={errors.oldPassword?.message}
        {...register('oldPassword')}
      />
      <Input
        label='Новий пароль'
        type='password'
        error={errors.newPassword?.message}
        {...register('newPassword')}
      />
      <Input
        label='Повторіть новий пароль'
        type='password'
        error={errors.confirmNewPassword?.message}
        {...register('confirmNewPassword')}
      />

      <button
        type='submit'
        disabled={isSubmitting}
        className='rounded-xl bg-[var(--color-primary)] px-4 py-3 text-white disabled:opacity-70'
      >
        Змінити пароль
      </button>
    </form>
  )
}
```

## Output Format
Use this exact response structure:

```md
**Schema**
- <fields + key validation rules>

**Form Wiring**
1. <useForm + resolver>
2. <Input mapping + errors>
3. <submit handler + pending state>

**Files**
- [path/to/file](path/to/file) — <what changed>

**UX**
- <how errors appear (inline/toast), disabled states, loaders>
```

**Created**: 2026-05-05
**Skill version**: 1.0
