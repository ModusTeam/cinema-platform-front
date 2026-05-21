import { Wallet } from 'lucide-react'

interface BalanceWidgetProps {
  pointsBalance: number
  updatedAt: string
}

const BalanceWidget = ({ pointsBalance, updatedAt }: BalanceWidgetProps) => {
  const updatedDate = new Date(updatedAt)

  return (
    <div className='rounded-3xl border border-white/10 bg-[var(--bg-card)] p-6 shadow-xl'>
      <div className='flex items-center justify-between'>
        <div>
          <div className='text-xs uppercase tracking-wider text-[var(--text-muted)]'>
            Баланс балів
          </div>
          <div className='mt-2 text-3xl font-black text-white'>
            {pointsBalance} балів
          </div>
          <div className='mt-2 text-xs text-[var(--text-muted)]'>
            Оновлено: {updatedDate.toLocaleDateString('uk-UA')}
          </div>
        </div>
        <div className='rounded-2xl border border-white/10 bg-white/5 p-3 text-[var(--color-primary)]'>
          <Wallet size={24} />
        </div>
      </div>
      <p className='mt-4 text-sm text-[var(--text-muted)]'>
        Використовуйте бали для майбутніх бронювань та бонусів.
      </p>
    </div>
  )
}

export default BalanceWidget
