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
      <div className='flex flex-col gap-1 border-l-2 border-white/5 py-1 pl-4'>
        <span className='text-sm font-medium text-neutral-400'>
          День народження
        </span>
        <span className='text-xs text-neutral-600'>
          Бонус доступний у ваш святковий місяць
        </span>
      </div>
    )
  }

  return (
    <div className='flex flex-col gap-1 border-l-2 border-emerald-500/50 py-1 pl-4'>
      <div className='flex items-center gap-2 text-emerald-400'>
        <Gift size={16} />
        <span className='text-sm font-medium'>Свято вже тут</span>
      </div>
      <p className='text-xs text-neutral-400'>
        {isClaimed
          ? 'Святковий бонус вже на вашому балансі.'
          : `Отримайте +${bonusPoints || 0} балів до дня народження.`}
      </p>
    </div>
  )
}

export default BirthdayBonusBanner
