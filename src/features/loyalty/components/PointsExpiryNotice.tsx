import { AlarmClock } from 'lucide-react'

interface PointsExpiryNoticeProps {
  expiryDate?: string
}

const PointsExpiryNotice = ({ expiryDate }: PointsExpiryNoticeProps) => {
  if (!expiryDate) {
    return (
      <div className='rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-[var(--text-muted)]'>
        Інформація про термін дії балів буде доступна після підключення бекенду.
      </div>
    )
  }

  const expiry = new Date(expiryDate)
  const daysLeft = Math.max(
    0,
    Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  )

  return (
    <div className='rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5'>
      <div className='flex items-center gap-3 text-amber-200'>
        <AlarmClock size={18} />
        <span className='text-sm font-semibold'>
          До завершення терміну дії балів: {daysLeft} днів
        </span>
      </div>
      <p className='mt-2 text-xs text-amber-100/80'>
        Використайте бали до {expiry.toLocaleDateString('uk-UA')}.
      </p>
    </div>
  )
}

export default PointsExpiryNotice
