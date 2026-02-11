import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Input from '../common/components/Input'
import {
  Save,
  LogOut,
  LayoutDashboard,
  Ticket,
  History,
  Settings,
  Lock,
  CreditCard,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import TicketCard from '../features/profile/components/TicketCard'
import { useProfile, type TabType } from '../features/profile/hooks/useProfile'
import { GridLoader } from '../common/components/GridLoader'

const profileSchema = z
  .object({
    firstName: z.string().min(1, "Ім'я обов'язкове").max(50),
    lastName: z.string().min(1, "Прізвище обов'язкове").max(50),
    email: z.string().email(),
    oldPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmNewPassword: z.string().optional(),
  })
  .refine(
    data => {
      if (data.newPassword && data.newPassword.length > 0) {
        return data.oldPassword && data.oldPassword.length > 0
      }
      return true
    },
    {
      message: 'Введіть поточний пароль для підтвердження змін',
      path: ['oldPassword'],
    },
  )
  .refine(
    data => {
      if (data.newPassword && data.newPassword.length > 0) {
        return data.newPassword === data.confirmNewPassword
      }
      return true
    },
    {
      message: 'Паролі не співпадають',
      path: ['confirmNewPassword'],
    },
  )
  .refine(
    data => {
      if (data.newPassword && data.newPassword.length > 0) {
        return data.newPassword.length >= 6
      }
      return true
    },
    {
      message: 'Мінімум 6 символів',
      path: ['newPassword'],
    },
  )

type ProfileFormData = z.infer<typeof profileSchema>

const ProfilePage = () => {
  const {
    user,
    logout,
    activeTab,
    setActiveTab,
    activeTickets,
    historyOrders,
    isLoadingTickets,
    isSaving,
    updateProfileData,
  } = useProfile()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      oldPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  })

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.name || '',
        lastName: user.surname || '',
        email: user.email || '',
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      })
    }
  }, [user, reset])

  const onSubmit = async (data: ProfileFormData) => {
    const success = await updateProfileData(data)
    if (success) {
      reset({
        ...data,
        oldPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      })
    }
  }

  if (!user) return null

  const initials = `${user.name[0]}${user.surname[0]}`.toUpperCase()

  return (
    <div className='min-h-screen bg-[var(--bg-main)] relative overflow-hidden'>
      <div className='absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--color-primary)]/10 rounded-full blur-[120px] pointer-events-none' />
      <div className='absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none' />

      <div className='container mx-auto max-w-6xl px-4 py-12 relative z-10'>
        <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700'>
          <div>
            <h1 className='text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2'>
              Особистий{' '}
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-orange-500'>
                Кабінет
              </span>
            </h1>
            <p className='text-[var(--text-muted)] text-lg'>
              Керуйте своїми квитками та налаштуваннями.
            </p>
          </div>

          {user.role === 'admin' && (
            <Link
              to='/admin'
              className='group flex items-center gap-3 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black transition-all hover:bg-zinc-200 hover:scale-105 active:scale-95 shadow-xl'
            >
              <LayoutDashboard
                size={18}
                className='group-hover:rotate-90 transition-transform duration-500'
              />
              Адмін-панель
            </Link>
          )}
        </div>

        <div className='grid gap-8 lg:grid-cols-[340px_1fr]'>
          <div className='space-y-6 animate-in slide-in-from-left-4 fade-in duration-700 delay-150'>
            <div className='relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#151515] to-black p-8 shadow-2xl group'>
              <div className='absolute -top-12 -right-12 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-[var(--color-primary)]/20 transition-colors duration-500'></div>

              <div className='relative z-10 flex flex-col items-center text-center'>
                <div className='mb-6 relative'>
                  <div className='absolute inset-0 bg-[var(--color-primary)] blur-xl opacity-20 rounded-full animate-pulse-slow'></div>
                  <div className='relative h-24 w-24 flex items-center justify-center rounded-full bg-gradient-to-br from-zinc-800 to-black border border-white/10 text-3xl font-black text-white shadow-inner'>
                    {initials}
                  </div>
                  <div className='absolute bottom-0 right-0 p-1.5 bg-black rounded-full border border-white/10'>
                    <div className='w-3 h-3 bg-green-500 rounded-full animate-pulse'></div>
                  </div>
                </div>

                <h2 className='text-2xl font-bold text-white mb-1'>
                  {user.name} {user.surname}
                </h2>
                <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-xs font-mono text-zinc-400 mb-6'>
                  <CreditCard size={12} />
                  <span>MEMBER ID: {user.id.slice(0, 8)}...</span>
                </div>

                <div className='w-full grid grid-cols-2 gap-4 py-6 border-t border-white/5'>
                  <div>
                    <div className='text-2xl font-black text-white'>
                      {activeTickets.length}
                    </div>
                    <div className='text-[10px] uppercase tracking-wider text-zinc-500 font-bold'>
                      Активні
                    </div>
                  </div>
                  <div>
                    <div className='text-2xl font-black text-white'>
                      {historyOrders.length}
                    </div>
                    <div className='text-[10px] uppercase tracking-wider text-zinc-500 font-bold'>
                      Історія
                    </div>
                  </div>
                </div>

                <div className='w-full pt-6 border-t border-white/5'>
                  <div className='flex items-center justify-between text-xs text-zinc-500 mb-4'>
                    <span>STATUS</span>
                    <span className='text-[var(--color-primary)] font-bold flex items-center gap-1'>
                      <Sparkles size={10} /> CINEMA CLUB
                    </span>
                  </div>
                  <div className='w-full h-1 bg-white/5 rounded-full overflow-hidden'>
                    <div className='h-full w-3/4 bg-gradient-to-r from-[var(--color-primary)] to-orange-500 rounded-full'></div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type='button'
              onClick={() => logout()}
              className='flex w-full items-center justify-center gap-2 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm font-bold text-zinc-400 transition-all hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20'
            >
              <LogOut size={18} /> Вийти з акаунту
            </button>
          </div>

          <div className='animate-in slide-in-from-right-4 fade-in duration-700 delay-300'>
            <div className='mb-8 p-1.5 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-md inline-flex w-full sm:w-auto overflow-x-auto no-scrollbar'>
              {(['active-tickets', 'history', 'settings'] as TabType[]).map(
                tab => (
                  <button
                    key={tab}
                    type='button'
                    onClick={() => setActiveTab(tab)}
                    className={clsx(
                      'flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-300 relative overflow-hidden group min-w-[140px] justify-center',
                      activeTab === tab
                        ? 'text-white shadow-lg'
                        : 'text-zinc-500 hover:text-white hover:bg-white/5',
                    )}
                  >
                    {activeTab === tab && (
                      <div className='absolute inset-0 bg-white/10 border border-white/10 rounded-xl' />
                    )}

                    <span className='relative z-10 flex items-center gap-2'>
                      {tab === 'active-tickets' && <Ticket size={16} />}
                      {tab === 'history' && <History size={16} />}
                      {tab === 'settings' && <Settings size={16} />}
                      {tab === 'active-tickets'
                        ? 'Квитки'
                        : tab === 'history'
                          ? 'Історія'
                          : 'Профіль'}
                    </span>
                  </button>
                ),
              )}
            </div>

            <div className='min-h-[400px]'>
              {activeTab === 'active-tickets' && (
                <div className='space-y-4 animate-in fade-in zoom-in-95 duration-300'>
                  <div className='flex items-center justify-between mb-4 px-2'>
                    <h3 className='text-lg font-bold text-white flex items-center gap-2'>
                      <Ticket
                        size={18}
                        className='text-[var(--color-primary)]'
                      />
                      Ваші майбутні сеанси
                    </h3>
                  </div>

                  {isLoadingTickets ? (
                    <div className='flex py-20 justify-center'>
                      <GridLoader className='animate-spin text-[var(--color-primary)] w-8 h-8' />
                    </div>
                  ) : activeTickets.length > 0 ? (
                    <div className='grid gap-4'>
                      {activeTickets.map(ticket => (
                        <TicketCard key={ticket.id} order={ticket} />
                      ))}
                    </div>
                  ) : (
                    <div className='flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02]'>
                      <div className='w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6'>
                        <Ticket className='h-10 w-10 text-[var(--text-muted)] opacity-50' />
                      </div>
                      <h3 className='text-xl font-bold text-white mb-2'>
                        Активних квитків немає
                      </h3>
                      <p className='text-zinc-500 max-w-xs mx-auto mb-6'>
                        Здається, ви ще не спланували похід у кіно. Саме час це
                        виправити!
                      </p>
                      <Link
                        to='/sessions'
                        className='rounded-xl bg-white px-6 py-3 text-sm font-bold text-black hover:bg-zinc-200 transition-colors'
                      >
                        Переглянути афішу
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className='space-y-4 animate-in fade-in zoom-in-95 duration-300'>
                  <div className='flex items-center justify-between mb-4 px-2'>
                    <h3 className='text-lg font-bold text-white flex items-center gap-2'>
                      <History size={18} className='text-zinc-500' />
                      Історія переглядів
                    </h3>
                  </div>

                  {historyOrders.length > 0 ? (
                    <div className='grid gap-4'>
                      {historyOrders.map(order => (
                        <TicketCard key={order.id} order={order} isHistory />
                      ))}
                    </div>
                  ) : (
                    <div className='flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02]'>
                      <History className='h-12 w-12 text-zinc-600 mb-4' />
                      <p className='font-medium text-zinc-500'>
                        Історія замовлень порожня
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className='animate-in fade-in zoom-in-95 duration-300'>
                  <div className='rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl p-8 shadow-2xl'>
                    <div className='mb-8 flex items-start gap-4'>
                      <div className='p-3 bg-white/5 rounded-2xl border border-white/5'>
                        <Settings className='h-6 w-6 text-white' />
                      </div>
                      <div>
                        <h3 className='text-xl font-bold text-white'>
                          Налаштування акаунту
                        </h3>
                        <p className='text-sm text-zinc-400 mt-1'>
                          Оновіть особисті дані та пароль.
                        </p>
                      </div>
                    </div>

                    <form
                      onSubmit={handleSubmit(onSubmit)}
                      className='space-y-8'
                    >
                      <div className='grid gap-6 md:grid-cols-2'>
                        <Input
                          label="Ім'я"
                          placeholder="Ваше ім'я"
                          error={errors.firstName?.message}
                          {...register('firstName')}
                          className='bg-black/20'
                        />
                        <Input
                          label='Прізвище'
                          placeholder='Ваше прізвище'
                          error={errors.lastName?.message}
                          {...register('lastName')}
                          className='bg-black/20'
                        />
                      </div>

                      <div className='relative'>
                        <Input
                          label='Email'
                          type='email'
                          disabled
                          {...register('email')}
                          className='opacity-50 cursor-not-allowed bg-black/20 pl-10'
                        />
                        <Lock
                          size={14}
                          className='absolute top-[38px] left-3 text-zinc-500'
                        />
                      </div>

                      <div className='pt-8 border-t border-white/5'>
                        <h4 className='mb-6 text-xs font-bold text-[var(--color-primary)] uppercase tracking-widest flex items-center gap-2'>
                          <Lock size={14} /> Безпека
                        </h4>

                        <div className='grid gap-5 p-6 rounded-2xl bg-white/[0.02] border border-white/5'>
                          <Input
                            label='Поточний пароль'
                            type='password'
                            placeholder='••••••••'
                            error={errors.oldPassword?.message}
                            {...register('oldPassword')}
                            className='bg-black/40'
                          />
                          <div className='grid gap-5 md:grid-cols-2'>
                            <Input
                              label='Новий пароль'
                              type='password'
                              placeholder='••••••••'
                              error={errors.newPassword?.message}
                              {...register('newPassword')}
                              className='bg-black/40'
                            />
                            <Input
                              label='Підтвердження'
                              type='password'
                              placeholder='••••••••'
                              error={errors.confirmNewPassword?.message}
                              {...register('confirmNewPassword')}
                              className='bg-black/40'
                            />
                          </div>
                        </div>
                      </div>

                      <div className='flex justify-end pt-4'>
                        <button
                          type='submit'
                          disabled={isSaving}
                          className='flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-8 py-4 text-sm font-bold text-white transition-all hover:bg-[var(--color-primary-hover)] shadow-lg shadow-[var(--color-primary)]/20 disabled:opacity-70 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95'
                        >
                          {isSaving ? (
                            <GridLoader className='h-4 w-4 animate-spin' />
                          ) : (
                            <Save className='h-4 w-4' />
                          )}
                          Зберегти зміни
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
