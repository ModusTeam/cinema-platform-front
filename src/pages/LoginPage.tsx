import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/AuthContext'
import Input from '../common/components/Input'
import { Clapperboard, ArrowRight } from 'lucide-react'
import { GridLoader } from '../common/components/GridLoader'

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
      navigate('/profile')
    } catch (error: any) {
      console.error(error)
      setServerError(error.message || 'Неправильний логін або пароль')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex min-h-[calc(100vh-4rem)]'>
      <div className='hidden lg:flex w-1/2 relative overflow-hidden bg-black items-center justify-center'>
        <div className='absolute inset-0 bg-[url("https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=2070&auto=format&fit=crop")] bg-cover bg-center opacity-40 mix-blend-overlay'></div>
        <div className='absolute inset-0 bg-gradient-to-r from-[var(--bg-main)] via-transparent to-[var(--bg-main)]'></div>
        <div className='relative z-10 p-12 text-center max-w-lg animate-in slide-in-from-left-10 duration-1000'>
          <div className='w-16 h-16 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-[0_0_40px_rgba(239,68,68,0.4)] transform rotate-6'>
            <Clapperboard size={32} className='text-white' />
          </div>
          <h2 className='text-4xl font-black text-white mb-4 tracking-tight leading-tight'>
            Магія кіно починається тут
          </h2>
          <p className='text-lg text-[var(--text-muted)]'>
            Отримуй доступ до ексклюзивних прем'єр, знижок та зручного
            бронювання квитків.
          </p>
        </div>
      </div>

      <div className='w-full lg:w-1/2 flex items-center justify-center p-6 bg-[var(--bg-main)] relative'>
        <div className='absolute top-20 right-20 w-64 h-64 bg-[var(--color-primary)]/10 rounded-full blur-[100px] pointer-events-none'></div>

        <div className='w-full max-w-md space-y-8 glass-panel p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-500'>
          <div className='text-center'>
            <h2 className='text-3xl font-bold tracking-tight text-white mb-2'>
              З поверненням
            </h2>
            <p className='text-sm text-[var(--text-muted)]'>
              Введіть свої дані для входу в акаунт
            </p>
          </div>

          {serverError && (
            <div className='p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center'>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
            <Input
              label='Email'
              type='email'
              placeholder='name@example.com'
              error={errors.email?.message}
              {...register('email')}
            />

            <div className='space-y-2'>
              <Input
                label='Пароль'
                type='password'
                placeholder='••••••••'
                error={errors.password?.message}
                {...register('password')}
              />
              <div className='flex justify-end'>
                <Link
                  to='#'
                  className='text-xs font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors'
                >
                  Забули пароль?
                </Link>
              </div>
            </div>

            <button
              type='submit'
              disabled={isSubmitting}
              className='w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-3.5 text-sm font-bold text-white transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-lg hover:shadow-[var(--color-primary)]/25 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed'
            >
              {isSubmitting ? (
                <GridLoader className='mr-2 h-5 w-5 animate-spin' />
              ) : (
                <>
                  Увійти <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t border-white/10'></span>
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-[#171717] px-2 text-[var(--text-muted)]'>
                або
              </span>
            </div>
          </div>

          <p className='text-center text-sm text-[var(--text-muted)]'>
            Немає акаунту?{' '}
            <Link
              to='/auth/register'
              className='font-bold text-white hover:text-[var(--color-primary)] transition-colors'
            >
              Зареєструватися
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
