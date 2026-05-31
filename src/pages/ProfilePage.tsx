import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { clsx } from 'clsx'
import {
  Award,
  BadgeCheck,
  CalendarDays,
  CreditCard,
  Gift,
  History,
  Info,
  LayoutDashboard,
  Lock,
  LogOut,
  Save,
  Settings,
  Shield,
  Sparkles,
  Ticket,
  User,
  type LucideIcon,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { AuroraText } from '@/common/components/AuroraText'
import EmptyState from '@/common/components/EmptyState'
import { GridLoader } from '@/common/components/GridLoader'
import Input from '@/common/components/Input'
import { LOYALTY_TIER_THRESHOLDS } from '@/constants/loyalty'
import { useLoyalty } from '@/features/account/hooks/useLoyalty'
import AchievementsTabPanel from '@/features/loyalty/achievements/AchievementsTabPanel'
import TicketCard from '@/features/profile/components/TicketCard'
import { type TabType, useProfile } from '@/features/profile/hooks/useProfile'
import type { LoyaltyTier } from '@/features/account/model/account.types'

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

const dateOfBirthSchema = z.object({
  dateOfBirth: z
    .string()
    .min(1, 'Оберіть дату народження')
    .refine(value => !Number.isNaN(new Date(value).getTime()), {
      message: 'Оберіть коректну дату',
    })
    .refine(value => new Date(value) <= new Date(), {
      message: 'Дата народження не може бути в майбутньому',
    })
    .refine(value => new Date(value).getFullYear() >= 1900, {
      message: 'Оберіть коректну дату народження',
    }),
})

type DateOfBirthFormData = z.infer<typeof dateOfBirthSchema>

interface TabConfig {
  id: TabType
  label: string
  icon: LucideIcon
}

const TABS: TabConfig[] = [
  {
    id: 'active-tickets',
    label: 'Квитки',
    icon: Ticket,
  },
  {
    id: 'history',
    label: 'Історія',
    icon: History,
  },
  {
    id: 'achievements',
    label: 'Досягнення',
    icon: Award,
  },
  {
    id: 'settings',
    label: 'Профіль',
    icon: Settings,
  },
]

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

const getLoyaltyProgressPercent = (tier?: LoyaltyTier, points?: number) => {
  if (!tier || points === undefined) return 0

  if (tier === 'Gold') return 100

  const targetPoints =
    tier === 'Bronze'
      ? LOYALTY_TIER_THRESHOLDS.SILVER.points
      : LOYALTY_TIER_THRESHOLDS.GOLD.points
  const progress = (points / targetPoints) * 100
  return clamp(progress, 0, 100)
}

const toDateInputValue = (value: string | null | undefined) => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toISOString().slice(0, 10)
}

const getTodayInputValue = () => new Date().toISOString().slice(0, 10)

const StatItem = ({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: LucideIcon
}) => (
  <div className='rounded-xl border border-white/5 bg-white/[0.025] p-3'>
    <div className='mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500'>
      <Icon size={13} />
      {label}
    </div>
    <div className='text-xl font-black text-white'>{value}</div>
  </div>
)

const ProfilePage = () => {
  const navigate = useNavigate()
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
    isSavingDateOfBirth,
    setDateOfBirth,
  } = useProfile()

  const loyaltyQuery = useLoyalty()
  const loyaltyProgressPercent = getLoyaltyProgressPercent(
    loyaltyQuery.data?.tier,
    loyaltyQuery.data?.points,
  )
  const loyaltyLabel = loyaltyQuery.data
    ? `${loyaltyQuery.data.tier} • ${loyaltyQuery.data.points} балів`
    : '—'
  const loyaltyErrorMessage =
    loyaltyQuery.error instanceof Error
      ? loyaltyQuery.error.message
      : 'Помилка завантаження'

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

  const {
    register: registerDateOfBirth,
    handleSubmit: handleDateOfBirthSubmit,
    reset: resetDateOfBirth,
    watch: watchDateOfBirth,
    formState: { errors: dateOfBirthErrors, isValid: isDateOfBirthValid },
  } = useForm<DateOfBirthFormData>({
    resolver: zodResolver(dateOfBirthSchema),
    mode: 'onChange',
    defaultValues: {
      dateOfBirth: '',
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

      resetDateOfBirth({
        dateOfBirth: toDateInputValue(user.dateOfBirth),
      })
    }
  }, [user, reset, resetDateOfBirth])

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

  const onDateOfBirthSubmit = async (data: DateOfBirthFormData) => {
    const success = await setDateOfBirth(data.dateOfBirth)
    if (success) {
      resetDateOfBirth({ dateOfBirth: data.dateOfBirth })
    }
  }

  if (!user) return null

  const initials = `${user.name[0]}${user.surname[0]}`.toUpperCase()
  const fullName = `${user.name} ${user.surname}`
  const hasDateOfBirth = Boolean(user.dateOfBirth)
  const dateOfBirthValue = watchDateOfBirth('dateOfBirth')

  return (
    <div className='relative min-h-screen overflow-hidden bg-[var(--bg-main)]'>
      <div className='pointer-events-none absolute left-1/4 top-0 h-[460px] w-[460px] rounded-full bg-[var(--color-primary)]/10 blur-[120px]' />
      <div className='pointer-events-none absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-white/[0.03] blur-[120px]' />

      <div className='container relative z-10 mx-auto max-w-6xl px-4 py-10'>
        <header className='mb-8 flex flex-col gap-5 border-b border-white/5 pb-8 md:flex-row md:items-end md:justify-between'>
          <div>
            <span className='mb-3 inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-xs font-medium text-zinc-400'>
              <User size={14} />
              Персональний простір
            </span>
            <h1 className='text-4xl font-black uppercase tracking-tighter text-white md:text-5xl'>
              Особистий <AuroraText className='font-black'>Кабінет</AuroraText>
            </h1>
            <p className='mt-2 max-w-xl text-base text-[var(--text-muted)]'>
              Квитки, історія, статус лояльності та налаштування акаунту в
              одному місці.
            </p>
          </div>

          {user.role === 'admin' && (
            <Link
              to='/admin'
              className='group flex w-fit items-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black shadow-xl transition-all hover:bg-zinc-200 active:scale-95'
            >
              <LayoutDashboard
                size={18}
                className='transition-transform duration-500 group-hover:rotate-90'
              />
              Адмін-панель
            </Link>
          )}
        </header>

        <div className='grid gap-6 lg:grid-cols-[320px_1fr] lg:items-start'>
          <aside className='rounded-3xl border border-white/10 bg-black/35 p-5 shadow-2xl backdrop-blur-xl'>
            <div className='flex items-center gap-4 border-b border-white/5 pb-5'>
              <div className='relative'>
                <div className='absolute inset-0 rounded-full bg-[var(--color-primary)] opacity-20 blur-xl' />
                <div className='relative flex h-18 w-18 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-zinc-800 to-black text-2xl font-black text-white shadow-inner'>
                  {initials}
                </div>
                <div className='absolute bottom-1 right-1 rounded-full border border-black bg-emerald-500 p-1.5' />
              </div>

              <div className='min-w-0'>
                <h2 className='truncate text-xl font-bold text-white'>
                  {fullName}
                </h2>
                <div className='mt-1 flex flex-wrap items-center gap-2 text-xs text-zinc-500'>
                  <span className='inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 capitalize'>
                    <Shield size={12} />
                    {user.role}
                  </span>
                  <span className='inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-1 font-mono'>
                    <CreditCard size={12} />
                    {user.id.slice(0, 8)}
                  </span>
                </div>
              </div>
            </div>

            <div className='mt-5 grid grid-cols-2 gap-3'>
              <StatItem
                icon={Ticket}
                label='Активні'
                value={activeTickets.length}
              />
              <StatItem
                icon={History}
                label='Історія'
                value={historyOrders.length}
              />
            </div>

            <div className='mt-5 rounded-2xl border border-white/5 bg-white/[0.025] p-4'>
              <div className='mb-3 flex items-center justify-between gap-3 text-xs'>
                <span className='flex items-center gap-2 font-bold uppercase tracking-wider text-zinc-500'>
                  <BadgeCheck size={14} />
                  Статус
                </span>
                <span className='flex items-center gap-1 text-right font-bold text-[var(--color-primary)]'>
                  {loyaltyQuery.isLoading ? (
                    <span className='h-3 w-20 rounded-full bg-white/10 motion-safe:animate-pulse' />
                  ) : loyaltyQuery.error ? (
                    loyaltyErrorMessage
                  ) : (
                    <>
                      <Sparkles size={12} /> {loyaltyLabel}
                    </>
                  )}
                </span>
              </div>
              <div className='h-1.5 overflow-hidden rounded-full bg-white/5'>
                <div
                  className='h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-orange-500'
                  style={{ width: `${loyaltyProgressPercent}%` }}
                />
              </div>
              <p className='mt-3 text-xs leading-relaxed text-zinc-500'>
                Балами можна скористатися під час наступного бронювання.
              </p>
            </div>

            <div className='mt-5 grid gap-2'>
              <Link
                to='/account/loyalty'
                className='flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.035] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10'
              >
                <span className='flex items-center gap-2'>
                  <Sparkles size={17} />
                  Лояльність
                </span>
                <span className='text-xs text-zinc-500'>Баланс</span>
              </Link>
              <Link
                to='/profile/achievements'
                className='flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.035] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10'
              >
                <span className='flex items-center gap-2'>
                  <Award size={17} />
                  Досягнення
                </span>
                <span className='text-xs text-zinc-500'>Нагороди</span>
              </Link>
            </div>

            <button
              type='button'
              onClick={() => logout()}
              className='mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm font-bold text-zinc-400 transition-all hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-400'
            >
              <LogOut size={17} /> Вийти з акаунту
            </button>
          </aside>

          <main className='min-w-0 rounded-3xl border border-white/10 bg-black/30 p-4 shadow-2xl backdrop-blur-xl md:p-6'>
            <nav className='mb-6 grid gap-2 rounded-2xl border border-white/5 bg-black/35 p-1.5 sm:grid-cols-2 xl:grid-cols-4'>
              {TABS.map(tab => {
                const Icon = tab.icon

                return (
                  <button
                    key={tab.id}
                    type='button'
                    onClick={() => setActiveTab(tab.id)}
                    className={clsx(
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all',
                      activeTab === tab.id
                        ? 'bg-white/10 text-white shadow-lg ring-1 ring-white/10'
                        : 'text-zinc-500 hover:bg-white/5 hover:text-white',
                    )}
                  >
                    <Icon
                      size={17}
                      className={clsx(
                        'shrink-0',
                        activeTab === tab.id && 'text-[var(--color-primary)]',
                      )}
                    />
                    <span className='min-w-0 text-sm font-bold'>
                      {tab.label}
                    </span>
                  </button>
                )
              })}
            </nav>

            <section className='min-h-[420px]'>
              {activeTab === 'active-tickets' && (
                <div className='animate-in fade-in zoom-in-95 duration-300'>
                  {isLoadingTickets ? (
                    <div className='flex justify-center py-20'>
                      <GridLoader className='h-8 w-8 animate-spin text-[var(--color-primary)]' />
                    </div>
                  ) : activeTickets.length > 0 ? (
                    <div className='grid gap-4'>
                      {activeTickets.map(ticket => (
                        <TicketCard key={ticket.id} order={ticket} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={<Ticket className='h-12 w-12' />}
                      title='Активних квитків немає'
                      description='Заплануйте наступний сеанс, а QR-квиток зʼявиться тут одразу після бронювання.'
                      actionLabel='Переглянути афішу'
                      onAction={() => navigate('/sessions')}
                    />
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className='animate-in fade-in zoom-in-95 duration-300'>
                  {historyOrders.length > 0 ? (
                    <div className='grid gap-4'>
                      {historyOrders.map(order => (
                        <TicketCard key={order.id} order={order} isHistory />
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={<History className='h-12 w-12' />}
                      title='Історія замовлень порожня'
                      description='Після завершених або скасованих сеансів записи залишатимуться тут.'
                    />
                  )}
                </div>
              )}

              {activeTab === 'achievements' && (
                <div className='animate-in fade-in zoom-in-95 duration-300'>
                  <AchievementsTabPanel />
                </div>
              )}

              {activeTab === 'settings' && (
                <div className='animate-in fade-in zoom-in-95 duration-300'>
                  <form onSubmit={handleSubmit(onSubmit)} className='space-y-7'>
                    <div className='rounded-2xl border border-white/5 bg-white/[0.025] p-5'>
                      <h3 className='mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]'>
                        <User size={14} />
                        Особисті дані
                      </h3>
                      <div className='grid gap-5 md:grid-cols-2'>
                        <Input
                          label="Ім'я"
                          placeholder="Ваше ім'я"
                          error={errors.firstName?.message}
                          {...register('firstName')}
                          className='bg-black/30'
                        />
                        <Input
                          label='Прізвище'
                          placeholder='Ваше прізвище'
                          error={errors.lastName?.message}
                          {...register('lastName')}
                          className='bg-black/30'
                        />
                      </div>

                      <div className='relative mt-5'>
                        <Input
                          label='Email'
                          type='email'
                          disabled
                          {...register('email')}
                          className='cursor-not-allowed bg-black/30 pl-10 opacity-50'
                        />
                        <Lock
                          size={14}
                          className='absolute left-3 top-[38px] text-zinc-500'
                        />
                      </div>
                    </div>

                    <div className='rounded-2xl border border-white/5 bg-white/[0.025] p-5'>
                      <div className='mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between'>
                        <div>
                          <h3 className='flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]'>
                            <CalendarDays size={14} />
                            Дата народження
                          </h3>
                          <p className='mt-2 text-sm leading-relaxed text-zinc-500'>
                            Це необовʼязково зараз, але допоможе нам підготувати
                            для вас персональні привілеї.
                          </p>
                        </div>
                        {hasDateOfBirth && (
                          <span className='inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-zinc-400'>
                            <Lock size={12} />
                            Set once
                          </span>
                        )}
                      </div>

                      <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end'>
                        <div className='relative'>
                          {!hasDateOfBirth && (
                            <div
                              aria-hidden='true'
                              className='pointer-events-none absolute -left-2 top-[39px] hidden h-4 w-4 rotate-45 rounded-sm border-b border-l border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 md:block'
                            />
                          )}
                          <Input
                            label='Ваша дата'
                            type='date'
                            max={getTodayInputValue()}
                            disabled={hasDateOfBirth || isSavingDateOfBirth}
                            error={dateOfBirthErrors.dateOfBirth?.message}
                            {...registerDateOfBirth('dateOfBirth')}
                            className='bg-black/40'
                          />
                        </div>

                        {!hasDateOfBirth && (
                          <button
                            type='button'
                            onClick={handleDateOfBirthSubmit(
                              onDateOfBirthSubmit,
                            )}
                            disabled={
                              isSavingDateOfBirth ||
                              !dateOfBirthValue ||
                              !isDateOfBirthValid
                            }
                            className='flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-500/15 transition-all hover:bg-emerald-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60'
                          >
                            {isSavingDateOfBirth ? (
                              <GridLoader className='h-4 w-4 animate-spin' />
                            ) : (
                              <Save className='h-4 w-4' />
                            )}
                            Зберегти дату
                          </button>
                        )}
                      </div>

                      <div className='mt-4 rounded-xl border border-white/5 bg-black/25 p-4'>
                        <div className='flex gap-3'>
                          <div className='mt-0.5 shrink-0 rounded-full bg-[var(--color-primary)]/10 p-2 text-[var(--color-primary)]'>
                            {hasDateOfBirth ? (
                              <Info size={16} />
                            ) : (
                              <Gift size={16} />
                            )}
                          </div>
                          <p className='text-sm leading-relaxed text-zinc-400'>
                            {hasDateOfBirth
                              ? 'Дату народження можна вказати лише один раз.'
                              : 'Вкажіть дату народження, щоб у майбутньому отримувати бонуси або знижки до дня народження.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='rounded-2xl border border-white/5 bg-white/[0.025] p-5'>
                      <h3 className='mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]'>
                        <Lock size={14} /> Безпека
                      </h3>

                      <div className='grid gap-5'>
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

                    <div className='flex justify-end'>
                      <button
                        type='submit'
                        disabled={isSaving}
                        className='flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--color-primary)]/20 transition-all hover:bg-[var(--color-primary-hover)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-70'
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
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
