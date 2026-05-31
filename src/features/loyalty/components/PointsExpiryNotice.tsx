import { AlarmClock } from 'lucide-react'

interface PointsExpiryNoticeProps {
  expiryDate?: string
}

const PointsExpiryNotice = ({ expiryDate }: PointsExpiryNoticeProps) => {
  if (!expiryDate) {
    return (
      <div className='flex flex-col gap-1 border-l-2 border-white/5 py-1 pl-4'>
        <span className='text-sm font-medium text-neutral-400'>
          Термін дії балів
        </span>
        <span className='text-xs text-neutral-600'>
          Дані тимчасово недоступні
        </span>
      </div>
    )
  }

  const expiry = new Date(expiryDate)
  const daysLeft = Math.max(
    0,
    Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  )

  const isExpiringSoon = daysLeft <= 30
  const borderColor = isExpiringSoon ? 'border-amber-500/50' : 'border-white/10'
  const titleColor = isExpiringSoon ? 'text-amber-400' : 'text-neutral-300'
  const iconColor = isExpiringSoon ? 'text-amber-400' : 'text-neutral-500'

  return (
    <div className={`flex flex-col gap-1 border-l-2 ${borderColor} py-1 pl-4`}>
      <div className={`flex items-center gap-2 ${titleColor}`}>
        <AlarmClock size={16} className={iconColor} />
        <span className='text-sm font-medium'>
          {daysLeft} {daysLeft === 1 ? 'день' : 'днів'} до згоряння
        </span>
      </div>
      <p className='text-xs text-neutral-400'>
        Використайте бали до {expiry.toLocaleDateString('uk-UA')}
      </p>
    </div>
  )
}

export default PointsExpiryNotice
