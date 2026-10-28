import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import * as z from 'zod'
import { getBookingReturn } from '@/features/auth/lib/bookingReturn'
import { useAuth } from '@/features/auth/model/AuthContext'
import AuthLayout from '@/features/auth/ui/AuthLayout'
import Button from '@/shared/ui/Button'
import Input from '@/shared/ui/Input'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Введіть email')
    .email('Введіть коректну email адресу (наприклад, user@example.com)'),
  password: z.string().min(6, 'Пароль має бути мінімум 6 символів'),
})

type LoginFormData = z.infer<typeof loginSchema>

const LoginPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    setServerError(null)
    try {
      await login({ email: data.email, password: data.password })
      const destination = getBookingReturn(location.state)
      navigate(destination?.pathname ?? '/profile', {
        replace: true,
        state: destination?.state,
      })
    } catch (error: unknown) {
      setServerError(
        error instanceof Error
          ? error.message
          : 'Неправильний логін або пароль',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title='З поверненням'
      description='Увійдіть, щоб переглянути свої квитки та історію замовлень.'
      introTitle='Ваш наступний сеанс.'
      introDescription='Усе для вашого походу в кіно — квитки, замовлення та особисті дані в одному кабінеті.'
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-label='Вхід в акаунт'
      >
        <fieldset disabled={isSubmitting} className='min-w-0 space-y-5'>
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
            autoComplete='current-password'
            required
            error={errors.password?.message}
            {...register('password')}
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
            {isSubmitting ? 'Входимо…' : 'Увійти'}
            <ArrowRight size={18} className='shrink-0' aria-hidden='true' />
          </Button>
        </fieldset>
      </form>
      <p className='auth-alternate'>
        Немає акаунту?
        <Link to='/auth/register' className='auth-link'>
          Зареєструватися
        </Link>
      </p>
    </AuthLayout>
  )
}

export default LoginPage
