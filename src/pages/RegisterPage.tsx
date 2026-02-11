import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authService } from '../services/authService'
import Input from '../common/components/Input'
import { Ticket, ArrowRight } from 'lucide-react'
import { GridLoader } from '../common/components/GridLoader'

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
      alert('Реєстрація успішна! Тепер увійдіть у свій акаунт.')
      navigate('/auth/login')
    },
    onError: (error: any) => {
      console.error(error)
      setServerError(
        error.response?.data?.title || error.message || 'Помилка реєстрації',
      )
    },
  })

  const onSubmit = (data: RegisterFormData) => {
    setServerError(null)
    registerMutation.mutate(data)
  }

  const isSubmitting = registerMutation.isPending

  return (
    <div className='flex min-h-[calc(100vh-4rem)]'>
      <div className='hidden lg:flex w-1/2 relative overflow-hidden bg-black items-center justify-center'>
        <div className='absolute inset-0 bg-[url("https://images.unsplash.com/photo-1517604931442-710e8705296c?q=80&w=2070&auto=format&fit=crop")] bg-cover bg-center opacity-40 mix-blend-overlay'></div>
        <div className='absolute inset-0 bg-gradient-to-l from-[var(--bg-main)] via-transparent to-[var(--bg-main)]'></div>
        <div className='relative z-10 p-12 text-center max-w-lg animate-in slide-in-from-right-10 duration-1000'>
          <div className='w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/20 transform -rotate-3'>
            <Ticket size={32} className='text-[var(--color-primary)]' />
          </div>
          <h2 className='text-4xl font-black text-white mb-4 tracking-tight leading-tight'>
            Приєднуйся до клубу
          </h2>
          <p className='text-lg text-[var(--text-muted)]'>
            Створи акаунт, щоб зберігати історію переглядів, отримувати бонуси
            та купувати квитки в один клік.
          </p>
        </div>
      </div>

      <div className='w-full lg:w-1/2 flex items-center justify-center p-6 bg-[var(--bg-main)] relative'>
        <div className='absolute bottom-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none'></div>

        <div className='w-full max-w-md space-y-8 glass-panel p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500'>
          <div className='text-center'>
            <h2 className='text-3xl font-bold tracking-tight text-white mb-2'>
              Створити акаунт
            </h2>
            <p className='text-sm text-[var(--text-muted)]'>
              Заповніть форму для реєстрації
            </p>
          </div>

          {serverError && (
            <div className='p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center whitespace-pre-line'>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <Input
                label="Ім'я"
                placeholder='Андрій'
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label='Прізвище'
                placeholder='Шевченко'
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>

            <Input
              label='Email'
              type='email'
              placeholder='name@example.com'
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label='Пароль'
              type='password'
              placeholder='••••••••'
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label='Підтвердження'
              type='password'
              placeholder='••••••••'
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full flex items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-bold text-black transition-all hover:bg-zinc-200 hover:shadow-lg active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4'
            >
              {isSubmitting ? (
                <GridLoader className='mr-2 h-5 w-5 animate-spin' />
              ) : (
                <>
                  Створити акаунт <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className='text-center text-sm text-[var(--text-muted)]'>
            Вже є акаунт?{' '}
            <Link
              to='/auth/login'
              className='font-bold text-white hover:text-[var(--color-primary)] transition-colors'
            >
              Увійти
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
