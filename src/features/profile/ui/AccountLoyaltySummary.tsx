import { Link } from 'react-router-dom'
import { useLoyaltyProfile } from '@/features/loyalty/model/useLoyaltyProfile'

export default function AccountLoyaltySummary() {
  const { data, isLoading, error, refetch } = useLoyaltyProfile()
  return (
    <section
      aria-label='Статус лояльності'
      className='border-t border-[var(--account-rule)] pt-5'
    >
      <div className='mb-3 flex flex-wrap justify-between gap-2'>
        <h2 className='text-sm'>Лояльність</h2>
        <Link to='/account/loyalty' className='account-link text-sm'>
          Докладніше ↗
        </Link>
      </div>
      {isLoading ? (
        <output className='text-sm text-[var(--account-muted)]'>
          Завантажуємо баланс…
        </output>
      ) : error ? (
        <div className='text-sm'>
          <output>Баланс тимчасово недоступний.</output>
          <button
            type='button'
            onClick={() => void refetch()}
            className='account-link mt-2 min-h-11'
          >
            Спробувати ще раз
          </button>
        </div>
      ) : data ? (
        <>
          <div className='flex flex-wrap items-baseline justify-between gap-2'>
            <p className='account-subheading'>{data.tier.label}</p>
            <p className='text-sm tabular-nums'>
              {data.pointsBalance.toLocaleString('uk-UA')} балів
            </p>
          </div>
          <progress
            aria-label={
              data.nextTier
                ? `Прогрес до ${data.nextTier.label}`
                : 'Максимальний рівень'
            }
            max={100}
            value={data.progressPercent}
            className='account-progress mt-4 w-full'
          />
          <p className='mt-2 text-xs leading-relaxed text-[var(--account-muted)]'>
            {data.nextTier
              ? `${data.nextTier.minPoints.toLocaleString('uk-UA')} балів — поріг ${data.nextTier.label}`
              : 'Максимальний рівень досягнуто'}
          </p>
        </>
      ) : (
        <p className='text-sm'>Баланс поки недоступний.</p>
      )}
    </section>
  )
}
