import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { User } from '@/features/auth/model/auth.types'
import { buttonStyles } from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import {
  type DateOfBirthFormData,
  dateOfBirthSchema,
  type ProfileFormData,
  profileSchema,
} from '../model/profile.schema'
import type { ProfileUpdateData } from '../model/useProfile'

interface AccountSettingsProps {
  user: User
  saving: boolean
  savingDateOfBirth: boolean
  onSave: (data: ProfileUpdateData) => Promise<boolean>
  onSaveDateOfBirth: (date: string) => Promise<boolean>
}

const toDateInputValue = (value: string | null | undefined) => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
}

export default function AccountSettings({
  user,
  saving,
  savingDateOfBirth,
  onSave,
  onSaveDateOfBirth,
}: AccountSettingsProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.name,
      lastName: user.surname,
      email: user.email,
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  })
  const {
    register: registerDate,
    handleSubmit: handleDateSubmit,
    reset: resetDate,
    watch,
    formState: { errors: dateErrors, isValid: validDate },
  } = useForm<DateOfBirthFormData>({
    resolver: zodResolver(dateOfBirthSchema),
    mode: 'onChange',
    defaultValues: { dateOfBirth: toDateInputValue(user.dateOfBirth) },
  })
  useEffect(() => {
    reset({
      firstName: user.name,
      lastName: user.surname,
      email: user.email,
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    })
    resetDate({ dateOfBirth: toDateInputValue(user.dateOfBirth) })
  }, [user.name, user.surname, user.email, user.dateOfBirth, reset, resetDate])
  const hasDateOfBirth = Boolean(user.dateOfBirth)
  const savedBirthDate = toDateInputValue(user.dateOfBirth)
  const birthDateHint = savedBirthDate
    ? `Збережено: ${new Intl.DateTimeFormat('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(new Date(savedBirthDate))}`
    : undefined
  const dateValue = watch('dateOfBirth')
  const submit = async (data: ProfileFormData) => {
    if (await onSave(data))
      reset({
        ...data,
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      })
  }
  const submitDate = async (data: DateOfBirthFormData) => {
    if (await onSaveDateOfBirth(data.dateOfBirth)) resetDate(data)
  }
  return (
    <form
      noValidate
      onSubmit={handleSubmit(submit)}
      className='account-settings'
    >
      <fieldset
        disabled={saving}
        className='min-w-0 border-b border-[var(--account-rule)] pb-9'
      >
        <legend className='account-subheading mb-6'>Особисті дані</legend>
        <div className='grid gap-6 sm:grid-cols-2'>
          <Input
            label='Ім’я'
            autoComplete='given-name'
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label='Прізвище'
            autoComplete='family-name'
            error={errors.lastName?.message}
            {...register('lastName')}
          />
          <div className='sm:col-span-2'>
            <Input
              label='Email'
              type='email'
              autoComplete='email'
              disabled
              hint='Адреса електронної пошти цього акаунту.'
              {...register('email')}
            />
          </div>
        </div>
      </fieldset>
      <fieldset className='mt-9 min-w-0 border-b border-[var(--account-rule)] pb-9'>
        <legend className='account-subheading mb-3'>Дата народження</legend>
        <p className='mb-5 text-sm leading-relaxed text-[var(--account-muted)]'>
          Дату народження можна вказати лише один раз.
        </p>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end'>
          <Input
            label='Ваша дата'
            type='date'
            max={new Date().toISOString().slice(0, 10)}
            disabled={hasDateOfBirth || savingDateOfBirth}
            hint={birthDateHint}
            error={dateErrors.dateOfBirth?.message}
            {...registerDate('dateOfBirth')}
          />
          {!hasDateOfBirth && (
            <button
              type='button'
              onClick={handleDateSubmit(submitDate)}
              disabled={savingDateOfBirth || !dateValue || !validDate}
              className={`${buttonStyles()} w-fit`}
            >
              {savingDateOfBirth ? 'Зберігаємо…' : 'Зберегти дату'}
            </button>
          )}
        </div>
      </fieldset>
      <fieldset
        disabled={saving}
        className='mt-9 min-w-0 border-b border-[var(--account-rule)] pb-9'
      >
        <legend className='account-subheading mb-3'>Безпека</legend>
        <p className='mb-6 text-sm text-[var(--account-muted)]'>
          Для зміни пароля введіть поточний і підтвердьте новий.
        </p>
        <div className='grid gap-6'>
          <Input
            label='Поточний пароль'
            type='password'
            autoComplete='current-password'
            error={errors.oldPassword?.message}
            {...register('oldPassword')}
          />
          <div className='grid gap-6 sm:grid-cols-2'>
            <Input
              label='Новий пароль'
              type='password'
              autoComplete='new-password'
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            <Input
              label='Підтвердження'
              type='password'
              autoComplete='new-password'
              error={errors.confirmNewPassword?.message}
              {...register('confirmNewPassword')}
            />
          </div>
        </div>
      </fieldset>
      <div className='mt-7 flex flex-wrap items-center justify-between gap-4'>
        <output className='text-sm text-[var(--account-muted)]'>
          {saving
            ? 'Зберігаємо зміни…'
            : 'Пароль змінюється лише після заповнення відповідних полів.'}
        </output>
        <button type='submit' disabled={saving} className={buttonStyles()}>
          {saving ? 'Зберігаємо…' : 'Зберегти зміни'}
        </button>
      </div>
    </form>
  )
}
