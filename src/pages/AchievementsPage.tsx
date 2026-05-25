import { AlertCircle, ArrowLeft, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import AchievementCard from '@/features/loyalty/achievements/AchievementCard'
import { useAchievementsTabData } from '@/features/loyalty/achievements/hooks/useAchievementsTabData'

const LOADING_CARDS = [
  'achievement-loading-1',
  'achievement-loading-2',
  'achievement-loading-3',
  'achievement-loading-4',
  'achievement-loading-5',
  'achievement-loading-6',
]

const AchievementsPage = () => {
  const { data, error, isLoading } = useAchievementsTabData()

  return (
    <div className='relative min-h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)]'>
      <div className='pointer-events-none absolute left-1/2 top-0 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-white/[0.015] blur-[120px]' />

      <div className='relative mx-auto max-w-5xl px-4 pb-16 pt-28 md:px-8'>
        <Link
          to='/profile'
          className='group mb-8 flex w-fit items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-white'
        >
          <ArrowLeft
            size={16}
            className='transition-transform group-hover:-translate-x-1'
          />
          Назад до профілю
        </Link>

        <header className='mb-12 flex flex-col gap-2'>
          <h1 className='text-3xl font-medium tracking-tight text-white md:text-4xl'>
            Досягнення
          </h1>
          <p className='text-sm text-neutral-500'>
            {data
              ? `Відкрито ${data.summary.unlocked} з ${data.summary.total}`
              : 'Завантаження даних...'}
          </p>
        </header>

        <div className='mb-8 h-px w-full bg-white/5' />

        {isLoading ? (
          <div className='grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-3'>
            {LOADING_CARDS.map(key => (
              <div
                key={key}
                className='h-24 w-full rounded border border-white/5 bg-white/5 motion-safe:animate-pulse'
              />
            ))}
          </div>
        ) : error ? (
          <div className='border-l-2 border-red-500/50 py-2 pl-4'>
            <div className='flex items-center gap-2 text-red-400'>
              <AlertCircle size={18} />
              <span className='font-medium'>
                Досягнення тимчасово недоступні
              </span>
            </div>
            <p className='mt-2 text-sm text-neutral-400'>
              {error instanceof Error
                ? error.message
                : 'Спробуйте оновити сторінку пізніше.'}
            </p>
          </div>
        ) : !data || data.achievements.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-center'>
            <Sparkles className='mb-4 h-8 w-8 text-neutral-600' />
            <h3 className='text-lg font-medium text-white'>Список порожній</h3>
            <p className='mt-2 text-sm text-neutral-500'>
              Досягнення зʼявляться згодом.
            </p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2 lg:grid-cols-3'>
            {data.achievements.map(achievement => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AchievementsPage
