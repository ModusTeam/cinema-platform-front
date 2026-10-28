import { History, Ticket } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { OrderItem } from '@/entities/order/model/order.types'
import EmptyState from '@/shared/ui/EmptyState'
import UnavailableState from '@/shared/ui/UnavailableState'
import TicketCard from './TicketCard'

interface AccountOrdersProps {
  orders: OrderItem[]
  history?: boolean
  loading: boolean
  error: boolean
  onRetry: () => void
}

export default function AccountOrders({
  orders,
  history = false,
  loading,
  error,
  onRetry,
}: AccountOrdersProps) {
  const navigate = useNavigate()
  if (loading)
    return (
      <output className='py-16 text-[var(--account-muted)]'>
        Завантажуємо замовлення…
      </output>
    )
  // A failed refetch must not leave an old admission QR available.
  if (error)
    return <UnavailableState className='account-state' onRetry={onRetry} />
  if (orders.length === 0)
    return (
      <EmptyState
        className='account-state'
        icon={
          history ? (
            <History className='h-12 w-12' />
          ) : (
            <Ticket className='h-12 w-12' />
          )
        }
        title={history ? 'Історія замовлень порожня' : 'Активних квитків немає'}
        description={
          history
            ? 'Після завершених або скасованих сеансів записи залишатимуться тут.'
            : 'Оберіть наступний сеанс. Після підтвердження оплати ваші квитки з’являться тут.'
        }
        actionLabel={history ? undefined : 'Переглянути афішу'}
        onAction={history ? undefined : () => navigate('/sessions')}
      />
    )
  return (
    <div className='grid gap-8'>
      {orders.map(order => (
        <TicketCard key={order.id} order={order} isHistory={history} />
      ))}
    </div>
  )
}
