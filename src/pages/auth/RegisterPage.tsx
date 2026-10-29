import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import * as z from 'zod'
import { authService } from '@/features/auth/api/auth.service'
import AuthLayout from '@/features/auth/ui/AuthLayout'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'
import { useToast } from '@/shared/ui/toast/ToastContext'

const registerSchema = z
  .object({
    firstName: z.string().min(1, "Введіть ім'я"),
    lastName: z.string().min(1, 'Введіть прізвище'),
    email: z.string().email('Невірний формат email'),
    password: z.string().min(6, 'Пароль мінімум 6 символів'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Паролі не співпадають',
    path: ['confirmPassword'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

const RegisterPage = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterFormData) =>
      authService.register(
        data.email,
        data.password,
        data.firstName,
        data.lastName,
      ),
    onSuccess: () => {
      toast.success('Акаунт створено. Увійдіть зі своїм email та паролем.')
      navigate('/auth/login')
    },
    onError: (error: unknown) => {
      setServerError(
        error instanceof Error ? error.message : 'Помилка реєстрації',
      )
    },
  })

  const onSubmit = (data: RegisterFormData) => {
    setServerError(null)
    registerMutation.mutate(data)
  }

  const isSubmitting = registerMutation.isPending

  return (
    <AuthLayout
      title='Створити акаунт'
      description='Зареєструйтеся, щоб мати свої квитки та замовлення під рукою.'
      introTitle='Побачимось у кіно.'
      introDescription='Оберіть фільм і свій сеанс. Придбані квитки зберігатимуться у вашому особистому кабінеті.'
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-label='Реєстрація акаунту'
      >
        <fieldset disabled={isSubmitting} className='min-w-0 space-y-5'>
          <div className='grid min-w-0 gap-5 sm:grid-cols-2'>
            <Input
              label="Ім'я"
              autoComplete='given-name'
              required
              error={errors.firstName?.message}
              {...register('firstName')}
            />
            <Input
              label='Прізвище'
              autoComplete='family-name'
              required
              error={errors.lastName?.message}
              {...register('lastName')}
            />
          </div>
          <Input
            label='Email'
            type='email'
            autoComplete='username'
            autoCapitalize='none'
            spellCheck={false}
            required
            placeholder='name@example.com'
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label='Пароль'
            type='password'
            autoComplete='new-password'
            required
            hint='Щонайменше 6 символів.'
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label='Підтвердження пароля'
            type='password'
            autoComplete='new-password'
            required
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          {serverError && (
            <p
              role='alert'
              className='whitespace-pre-line text-sm leading-relaxed text-[var(--color-error)]'
            >
              {serverError}
            </p>
          )}
          <Button
            type='submit'
            isLoading={isSubmitting}
            className='w-full py-3.5'
          >
            {isSubmitting ? 'Створюємо акаунт…' : 'Створити акаунт'}
            <ArrowRight size={18} className='shrink-0' aria-hidden='true' />
          </Button>
        </fieldset>
      </form>
      <p className='auth-alternate'>
        Вже є акаунт?
        <Link to='/auth/login' className='auth-link'>
          Увійти
        </Link>
      </p>
    </AuthLayout>
  )
}

export default RegisterPage
