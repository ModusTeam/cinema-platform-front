import { Gift } from 'lucide-react'

interface BirthdayBonusBannerProps {
  isBirthdayMonth: boolean
  bonusPoints?: number
  isClaimed?: boolean
}

const BirthdayBonusBanner = ({
  isBirthdayMonth,
  bonusPoints,
  isClaimed,
}: BirthdayBonusBannerProps) => {
  if (!isBirthdayMonth) {
    return (
      <div className='rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-[var(--text-muted)]'>
        День народження ще попереду. Бонус буде доступний у ваш місяць.
      </div>
    )
  }

  return (
    <div className='rounded-2xl border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 p-5'>
      <div className='flex items-center gap-3 text-[var(--color-primary)]'>
        <Gift size={18} />
        <span className='text-sm font-semibold'>
          Бонус до дня народження
        </span>
      </div>
      <p className='mt-2 text-xs text-white'>
        {isClaimed
          ? 'Бонус вже активовано у вашому балансі.'
          : `Отримаєте ${bonusPoints || 0} балів у святковий період.`}
      </p>
    </div>
  )
}

export default BirthdayBonusBanner
