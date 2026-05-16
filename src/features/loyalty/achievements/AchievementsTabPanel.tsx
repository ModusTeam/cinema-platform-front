import { AlertCircle, Sparkles } from 'lucide-react'

import { useAchievementsTabData } from '@/features/loyalty/achievements/hooks/useAchievementsTabData'
import AchievementCard from '@/features/loyalty/achievements/AchievementCard'
import AchievementProgressList from '@/features/loyalty/achievements/AchievementProgressList'

const AchievementsTabPanel = () => {
  const { data, isLoading, error } = useAchievementsTabData()

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='rounded-2xl border border-white/10 bg-[var(--bg-card)] p-6 motion-safe:animate-pulse motion-reduce:animate-none'>
          <div className='h-4 w-40 rounded bg-white/10' />
          <div className='mt-4 h-3 w-60 rounded bg-white/5' />
          <div className='mt-6 h-2 w-full rounded bg-white/10' />
        </div>
        <div className='grid gap-4 md:grid-cols-2'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className='h-32 rounded-2xl border border-white/10 bg-[var(--bg-card)] motion-safe:animate-pulse motion-reduce:animate-none'
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='rounded-2xl border border-red-500/20 bg-red-500/10 p-6'>
        <div className='flex items-center gap-2 text-red-200'>
          <AlertCircle size={18} />
          <span className='font-semibold'>Досягнення тимчасово недоступні</span>
        </div>
        <p className='mt-2 text-sm text-red-100/80'>
          Спробуйте ще раз трохи пізніше.
        </p>
      </div>
    )
  }

  if (!data || data.achievements.length === 0) {
    return (
      <div className='rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center'>
        <Sparkles className='mx-auto h-10 w-10 text-[var(--text-muted)]' />
        <h3 className='mt-4 text-lg font-bold text-white'>Поки що порожньо</h3>
        <p className='mt-2 text-sm text-[var(--text-muted)]'>
          Досягнення зʼявляться після першого бронювання.
        </p>
      </div>
    )
  }

  const inProgress = data.achievements.filter(
    item => item.status === 'in-progress',
  )

  return (
    <div className='space-y-8'>
      <div className='rounded-3xl border border-white/10 bg-[var(--bg-card)] p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-xl font-bold text-white'>Ваші досягнення</h3>
            <p className='text-sm text-[var(--text-muted)]'>
              Частина досягнень активується після підключення бекенду.
            </p>
          </div>
          <div className='text-right text-xs text-[var(--text-muted)]'>
            <div>Відкрито: {data.summary.unlocked}</div>
            <div>У процесі: {data.summary.inProgress}</div>
          </div>
        </div>
      </div>

      <section>
        <h4 className='text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4'>
          У прогресі
        </h4>
        <AchievementProgressList achievements={inProgress} />
      </section>

      <section className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h4 className='text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]'>
            Повний список
          </h4>
          <span className='text-xs text-[var(--text-muted)]'>
            Скоро будуть додані нові рівні
          </span>
        </div>
        <div className='grid gap-4 md:grid-cols-2'>
          {data.achievements.map(item => (
            <AchievementCard key={item.id} achievement={item} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default AchievementsTabPanel
