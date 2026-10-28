import { QRCodeSVG } from 'qrcode.react'
import { useId, useRef, useState } from 'react'
import {
  getOrderTickets,
  orderStatusLabels,
  ticketStatusLabels,
} from '@/entities/order/lib/orderPresentation'
import { type OrderItem, OrderStatus } from '@/entities/order/model/order.types'
import { useToast } from '@/shared/ui/toast/ToastContext'

interface TicketCardProps {
  order: OrderItem
  isHistory?: boolean
}

export default function TicketCard({
  order,
  isHistory = false,
}: TicketCardProps) {
  const titleId = useId()
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const summaryRef = useRef<HTMLElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [failedPoster, setFailedPoster] = useState(false)
  const toast = useToast()
  const tickets = getOrderTickets(order)
  const hasAdmission = tickets.some(ticket => ticket.canShowQr)
  const date = new Date(order.sessionDate)
  const validDate = !Number.isNaN(date.getTime())
  const status = orderStatusLabels[order.status] ?? 'Статус невідомий'
  const copyTicket = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id)
      toast.success('ID квитка скопійовано')
    } catch {
      toast.error('Не вдалося скопіювати ID. Скопіюйте його вручну.')
    }
  }

  return (
    <article
      aria-labelledby={titleId}
      className='digital-ticket'
      data-order-status={order.status}
    >
      <div className='grid min-w-0 lg:grid-cols-[minmax(0,1fr)_11rem]'>
        <div className='min-w-0 p-5 sm:p-7'>
          <div className='mb-5 flex flex-wrap items-center justify-between gap-3 text-xs'>
            <span className='tracking-wide'>{order.bookingId}</span>
            <span
              className={
                order.status === OrderStatus.Paid
                  ? 'font-medium'
                  : 'text-[var(--account-muted)]'
              }
            >
              {status}
              {isHistory && order.isPastSession ? ' · Минулий сеанс' : ''}
            </span>
          </div>
          <div className='flex items-start gap-5'>
            {order.posterUrl &&
            !failedPoster &&
            !order.posterUrl.includes('placehold.co') ? (
              <img
                src={order.posterUrl}
                alt=''
                onError={() => setFailedPoster(true)}
                className='hidden aspect-[2/3] w-20 shrink-0 object-cover sm:block'
              />
            ) : null}
            <div className='min-w-0 flex-1'>
              <h2 id={titleId} className='account-ticket-title'>
                {order.movieTitle}
              </h2>
              <dl className='mt-6 grid grid-cols-2 gap-x-4 gap-y-4 text-sm'>
                <div>
                  <dt className='account-label'>Дата</dt>
                  <dd className='mt-1'>
                    {validDate
                      ? new Intl.DateTimeFormat('uk-UA', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }).format(date)
                      : 'Дата уточнюється'}
                  </dd>
                </div>
                <div>
                  <dt className='account-label'>Час</dt>
                  <dd className='mt-1 text-xl tabular-nums'>
                    {validDate
                      ? new Intl.DateTimeFormat('uk-UA', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }).format(date)
                      : '—'}
                  </dd>
                </div>
                <div className='col-span-2'>
                  <dt className='account-label'>Зал</dt>
                  <dd className='mt-1'>{order.cinemaHall}</dd>
                </div>
              </dl>
            </div>
          </div>
          <div className='mt-6 border-t border-[var(--account-rule)] pt-4'>
            <p className='account-label'>Місця та статус квитків</p>
            <ul className='mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm'>
              {order.seats.map((seat, index) => (
                <li key={`${seat}-${order.ticketIds[index] ?? index}`}>
                  {seat}{' '}
                  <span className='text-[var(--account-muted)]'>
                    ·{' '}
                    {ticketStatusLabels[order.ticketStatuses[index]] ??
                      'Статус невідомий'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className='digital-ticket-stub grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 p-5 sm:p-7 lg:flex lg:flex-col lg:justify-between lg:gap-6'>
          <span className='font-sans text-lg font-black uppercase tracking-tighter'>
            Cinema.
          </span>
          <div>
            <p className='account-label'>Сплачено</p>
            <p className='mt-1 text-2xl tabular-nums'>
              {order.totalPrice.toLocaleString('uk-UA')} ₴
            </p>
          </div>
          <p className='col-span-2 text-xs leading-relaxed text-[var(--account-muted)]'>
            {hasAdmission
              ? 'QR-код кожного дійсного квитка — у деталях нижче.'
              : 'QR-код для входу недоступний.'}
          </p>
        </div>
      </div>
      <details
        ref={detailsRef}
        onToggle={event => setExpanded(event.currentTarget.open)}
        className='border-t border-[var(--account-rule)]'
      >
        <summary
          ref={summaryRef}
          className='account-ticket-summary cursor-pointer px-5 py-4 text-sm font-medium sm:px-7'
        >
          {hasAdmission ? 'Показати квитки' : 'Деталі замовлення'}
          <span className='sr-only'>
            : {order.movieTitle}, {order.bookingId}
          </span>
        </summary>
        {expanded && (
          <div className='px-5 pb-5 sm:px-7 sm:pb-7'>
            {!hasAdmission && (
              <p className='mb-5 text-sm text-[var(--account-muted)]'>
                Для входу потрібні підтверджена оплата та дійсний квиток.
              </p>
            )}
            <ul className='divide-y divide-[var(--account-rule)]'>
              {tickets.map(ticket => (
                <li
                  key={ticket.id}
                  className='grid min-w-0 gap-4 py-5 sm:grid-cols-[minmax(0,1fr)_auto]'
                  data-ticket-status={ticket.status}
                >
                  <div className='min-w-0'>
                    <h3 className='text-lg font-medium'>
                      Місце {ticket.seat ?? 'уточнюється'}
                    </h3>
                    <p className='mt-1 text-sm'>
                      {ticketStatusLabels[ticket.status] ?? 'Статус невідомий'}
                    </p>
                    <p className='mt-3 break-all font-mono text-xs select-text'>
                      {ticket.id}
                    </p>
                    <button
                      type='button'
                      onClick={() => void copyTicket(ticket.id)}
                      className='account-link mt-2 min-h-11 text-sm'
                      aria-label={`Скопіювати ID квитка, місце ${ticket.seat ?? 'невідоме'}`}
                    >
                      Скопіювати ID
                    </button>
                  </div>
                  {ticket.canShowQr && (
                    <div className='w-fit bg-white p-2'>
                      <QRCodeSVG
                        value={ticket.id}
                        size={144}
                        marginSize={4}
                        title={`QR-код квитка, місце ${ticket.seat ?? 'невідоме'}`}
                      />
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <button
              type='button'
              className='account-link min-h-11 text-sm'
              onClick={() => {
                summaryRef.current?.focus()
                if (detailsRef.current) detailsRef.current.open = false
              }}
            >
              Згорнути квитки
            </button>
          </div>
        )}
      </details>
    </article>
  )
}
