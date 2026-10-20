import { useState } from 'react'
import {
  Armchair,
  CalendarDays,
  Check,
  Clock,
  Copy,
  MapPin,
  ReceiptText,
  Ticket,
  X,
} from 'lucide-react'

import {
  OrderStatus,
  TicketStatus,
  type OrderItem,
} from '@/entities/order/model/order.types'

const orderStatusLabels: Record<string, string> = {
  [OrderStatus.Pending]: 'Очікує оплати',
  [OrderStatus.PaymentProcessing]: 'Оплата обробляється',
  [OrderStatus.PaymentOutcomeUnknown]: 'Статус оплати уточнюється',
  [OrderStatus.Failed]: 'Оплата не вдалася',
  [OrderStatus.Cancelled]: 'Скасовано',
  [OrderStatus.Expired]: 'Термін минув',
}

const ticketStatusLabels: Record<string, string> = {
  [TicketStatus.Reserved]: 'Зарезервовано',
  [TicketStatus.Used]: 'Використано',
  [TicketStatus.Refunded]: 'Повернено',
  [TicketStatus.Released]: 'Звільнено',
}

interface TicketCardProps {
  order: OrderItem
  isHistory?: boolean
}

const TicketCard = ({ order, isHistory = false }: TicketCardProps) => {
  const [showTickets, setShowTickets] = useState(false)
  const [copiedTicketId, setCopiedTicketId] = useState<string | null>(null)
  const dateObj = new Date(order.sessionDate)

  const handleCopy = (ticketId: string) => {
    void navigator.clipboard.writeText(ticketId)
    setCopiedTicketId(ticketId)
    setTimeout(() => setCopiedTicketId(null), 2000)
  }

  const formattedDate = new Intl.DateTimeFormat('uk-UA', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  }).format(dateObj)
  const formattedTime = new Intl.DateTimeFormat('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
  const canShowTickets =
    !isHistory &&
    order.status === OrderStatus.Paid &&
    order.ticketStatuses.some(status => status === TicketStatus.Valid)
  const statusLabel =
    orderStatusLabels[order.status] ??
    (order.status === OrderStatus.Paid
      ? isHistory
        ? 'Завершено'
        : 'Оплачено'
      : 'Статус невідомий')

  return (
    <div className='group relative min-h-[210px] overflow-hidden rounded-2xl border border-white/5 bg-[#171717] shadow-lg transition-all duration-300 hover:border-white/10 hover:shadow-[0_0_30px_-8px_rgba(239,68,68,0.18)]'>
      <div
        className={`absolute inset-0 z-20 flex flex-col items-center justify-between bg-[#171717] p-4 transition-transform duration-500 ease-in-out ${
          showTickets
            ? 'translate-y-0 opacity-100'
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className='mb-2 flex w-full items-center justify-between'>
          <h3 className='flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--color-primary)]'>
            <Ticket size={14} /> Квитки для входу
          </h3>
          <button
            type='button'
            onClick={() => setShowTickets(false)}
            className='rounded-full bg-white/5 p-1.5 text-[var(--text-muted)] transition-colors hover:bg-white/10 hover:text-white'
          >
            <X size={18} />
          </button>
        </div>

        <div className='min-h-0 w-full flex-1 space-y-2 overflow-y-auto py-2'>
          {order.ticketIds.map((ticketId, index) =>
            order.ticketStatuses[index] === TicketStatus.Valid ? (
              <div
                key={ticketId}
                className='flex items-center justify-between gap-2 rounded-xl border border-white/5 bg-white/5 p-3'
              >
                <div className='min-w-0'>
                  <div className='text-xs text-[var(--text-muted)]'>
                    Місце {order.seats[index]}
                  </div>
                  <div
                    className='truncate font-mono text-xs text-white'
                    title={ticketId}
                  >
                    {ticketId}
                  </div>
                </div>
                <button
                  type='button'
                  onClick={() => handleCopy(ticketId)}
                  className='shrink-0 rounded-lg bg-white/5 p-2 text-white hover:bg-white/10'
                  title='Скопіювати ID квитка'
                >
                  {copiedTicketId === ticketId ? (
                    <Check size={14} className='text-green-500' />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
            ) : null,
          )}
        </div>
      </div>

      <div
        className={`flex h-full flex-col transition-transform duration-500 sm:flex-row ${showTickets ? 'scale-95 opacity-30 blur-[2px]' : ''}`}
      >
        <div className='relative h-44 w-full shrink-0 overflow-hidden sm:h-auto sm:w-36'>
          <img
            src={order.posterUrl}
            alt={order.movieTitle}
            className={`h-full w-full object-cover transition-all duration-700 group-hover:scale-105 ${isHistory ? 'grayscale opacity-50' : ''}`}
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent sm:bg-gradient-to-r sm:from-black/30 sm:to-transparent' />
          <div
            className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
              isHistory
                ? 'border-white/10 bg-black/60 text-zinc-300'
                : 'border-emerald-400/20 bg-emerald-500/15 text-emerald-200'
            }`}
          >
            {statusLabel}
          </div>
        </div>

        <div className='absolute bottom-0 top-0 left-36 z-10 hidden w-4 flex-col justify-between sm:flex'>
          <div className='-ml-2 -mt-2 h-4 w-4 rounded-full bg-[var(--bg-main)]' />
          <div className='ml-[1px] h-full border-l-2 border-dashed border-zinc-700/30' />
          <div className='-mb-2 -ml-2 h-4 w-4 rounded-full bg-[var(--bg-main)]' />
        </div>

        <div className='relative flex flex-1 flex-col justify-between bg-gradient-to-br from-white/[0.045] to-transparent p-5 sm:pl-8'>
          <div>
            <h3
              className={`mb-3 line-clamp-2 text-xl font-black leading-tight text-white ${isHistory ? 'text-[var(--text-muted)]' : 'transition-colors group-hover:text-[var(--color-primary)]'}`}
            >
              {order.movieTitle}
            </h3>

            <div className='grid gap-2 text-xs font-medium text-[var(--text-muted)] sm:grid-cols-2'>
              <div className='flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2'>
                <CalendarDays
                  size={15}
                  className='shrink-0 text-[var(--color-primary)]'
                />
                <span className='truncate text-white'>{formattedDate}</span>
              </div>
              <div className='flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2'>
                <Clock
                  size={15}
                  className='shrink-0 text-[var(--color-primary)]'
                />
                <span className='truncate text-white'>{formattedTime}</span>
              </div>
              <div className='flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 sm:col-span-2'>
                <MapPin size={15} className='shrink-0 text-white' />
                <span className='truncate'>{order.cinemaHall}</span>
              </div>
            </div>

            <div className='mt-4 flex flex-wrap items-center gap-2'>
              <span className='flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500'>
                <Armchair size={12} />
                Місця
              </span>
              {order.seats.map((seat, index) => (
                <span
                  key={seat}
                  className='inline-flex items-center rounded-md border border-white/5 bg-white/10 px-2 py-1 text-[10px] font-bold uppercase text-zinc-300'
                >
                  {seat}
                  {ticketStatusLabels[order.ticketStatuses[index]]
                    ? ` · ${ticketStatusLabels[order.ticketStatuses[index]]}`
                    : ''}
                </span>
              ))}
            </div>
          </div>

          <div className='mt-5 flex items-center justify-between border-t border-white/5 pt-3'>
            <div>
              <span className='flex items-center gap-1 text-[10px] uppercase tracking-wider text-[var(--text-muted)]'>
                <ReceiptText size={12} />
                Сума
              </span>
              <span className='text-lg font-bold text-white'>
                ₴ {order.totalPrice}
              </span>
            </div>

            {canShowTickets ? (
              <button
                type='button'
                onClick={() => setShowTickets(true)}
                className='flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black shadow-lg transition-colors hover:bg-zinc-200 active:scale-95'
              >
                <Ticket size={16} />
                <span>Квитки</span>
              </button>
            ) : (
              <div className='rounded border border-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500'>
                {statusLabel}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 5%; opacity: 0; }
          50% { top: 95%; }
        }
      `}</style>
    </div>
  )
}

export default TicketCard
