import { useState, useMemo } from 'react'
import { useUserActivity } from './hooks/useUserActivity'
import {
  Search,
  User,
  Ticket,
  LayoutList,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Mail,
  Ban,
} from 'lucide-react'
import { GridLoader } from '../../common/components/GridLoader'
import { clsx } from 'clsx'

const UserActivityPage = () => {
  const {
    users,
    isLoadingUsers,
    selectedUserId,
    selectUser,
    orders,
    tickets,
    isLoadingData,
    validateTicket,
    cancelOrder,
  } = useUserActivity()

  const [activeTab, setActiveTab] = useState<'orders' | 'tickets'>('orders')
  const [userSearchTerm, setUserSearchTerm] = useState('')

  const filteredUsers = useMemo(() => {
    const lowerTerm = userSearchTerm.toLowerCase()
    return users.filter(
      u =>
        u.email?.toLowerCase().includes(lowerTerm) ||
        (u.firstName && u.firstName.toLowerCase().includes(lowerTerm)) ||
        (u.lastName && u.lastName.toLowerCase().includes(lowerTerm)) ||
        u.id.toLowerCase().includes(lowerTerm),
    )
  }, [users, userSearchTerm])

  const getStatusBadge = (status: string) => {
    const s = String(status).toLowerCase()

    if (s === 'paid' || s === 'valid')
      return (
        <span className='bg-green-500/10 text-green-500 border-green-500/20 px-2 py-0.5 rounded text-xs font-bold border flex items-center gap-1 w-fit'>
          {s === 'paid' ? 'Paid' : 'Valid'}
        </span>
      )

    if (s === 'pending')
      return (
        <span className='bg-yellow-500/10 text-yellow-500 border-yellow-500/20 px-2 py-0.5 rounded text-xs font-bold border flex items-center gap-1 w-fit'>
          Pending
        </span>
      )

    if (s === 'used' || s === 'completed')
      return (
        <span className='bg-zinc-500/10 text-zinc-400 border-zinc-500/20 px-2 py-0.5 rounded text-xs font-bold border flex items-center gap-1 w-fit'>
          Used
        </span>
      )

    if (s === 'cancelled' || s === 'refunded' || s === 'failed')
      return (
        <span className='bg-red-500/10 text-red-500 border-red-500/20 px-2 py-0.5 rounded text-xs font-bold border flex items-center gap-1 w-fit'>
          {status}
        </span>
      )

    return (
      <span className='bg-white/10 text-white px-2 py-0.5 rounded text-xs border border-white/10 w-fit'>
        {status}
      </span>
    )
  }

  return (
    <div className='grid gap-6 lg:grid-cols-[350px_1fr] h-[calc(100vh-100px)]'>
      <div className='flex flex-col gap-4 bg-[var(--bg-card)] border border-white/5 rounded-2xl p-4 h-full overflow-hidden shadow-xl'>
        <div>
          <h2 className='text-lg font-bold text-white mb-1'>Користувачі</h2>
          <p className='text-xs text-[var(--text-muted)]'>
            Оберіть користувача
          </p>
        </div>

        <div className='relative'>
          <Search
            className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]'
            size={16}
          />
          <input
            type='text'
            placeholder="Пошук (Email, Ім'я, ID)..."
            value={userSearchTerm}
            onChange={e => setUserSearchTerm(e.target.value)}
            className='w-full rounded-xl bg-[var(--bg-main)] border border-white/10 py-2.5 pl-9 pr-4 text-sm text-white placeholder-[var(--text-muted)] focus:border-[var(--color-primary)] focus:outline-none'
          />
        </div>

        <div className='flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar'>
          {isLoadingUsers ? (
            <div className='flex justify-center py-10'>
              <GridLoader className='animate-spin text-[var(--color-primary)]' />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className='text-center py-10 text-[var(--text-muted)] text-sm'>
              Користувачів не знайдено
            </div>
          ) : (
            filteredUsers.map(user => (
              <button
                type='button'
                key={user.id}
                onClick={() => selectUser(user.id)}
                className={clsx(
                  'w-full text-left p-3 rounded-xl transition-all border border-transparent group',
                  selectedUserId === user.id
                    ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 shadow-lg'
                    : 'hover:bg-white/5 hover:border-white/5',
                )}
              >
                <div className='flex justify-between items-start'>
                  <div className='min-w-0'>
                    <div
                      className={clsx(
                        'font-medium text-sm truncate',
                        selectedUserId === user.id
                          ? 'text-white'
                          : 'text-[var(--text-muted)] group-hover:text-white',
                      )}
                      title={user.email}
                    >
                      {user.email}
                    </div>
                    {(user.firstName || user.lastName) && (
                      <div className='text-xs text-[var(--text-muted)] mt-0.5 truncate'>
                        {user.firstName} {user.lastName}
                      </div>
                    )}
                  </div>
                  {selectedUserId === user.id && (
                    <ChevronRight
                      size={16}
                      className='text-[var(--color-primary)] mt-1 shrink-0'
                    />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className='flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar'>
        {!selectedUserId ? (
          <div className='flex flex-col items-center justify-center h-full text-[var(--text-muted)] border border-dashed border-white/10 rounded-2xl bg-[var(--bg-card)]/30'>
            <User size={48} className='opacity-20 mb-4' />
            <p>Оберіть користувача зі списку зліва</p>
          </div>
        ) : (
          <>
            <div className='bg-[var(--bg-card)] border border-white/5 p-6 rounded-2xl shadow-lg shrink-0 animate-in fade-in slide-in-from-top-2'>
              <div className='flex items-center gap-4'>
                <div className='h-12 w-12 rounded-full bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center text-xl font-bold text-white border border-white/10'>
                  <User />
                </div>
                <div>
                  <h2 className='text-xl font-bold text-white'>
                    Активність користувача
                  </h2>
                  <div className='flex items-center gap-2 text-sm text-[var(--text-muted)]'>
                    <Mail size={14} />{' '}
                    {users.find(u => u.id === selectedUserId)?.email ||
                      selectedUserId}
                  </div>
                </div>
              </div>
            </div>

            {isLoadingData ? (
              <div className='flex justify-center py-20 min-h-[300px]'>
                <GridLoader className='animate-spin text-[var(--color-primary)] h-8 w-8' />
              </div>
            ) : (
              <div className='animate-in fade-in zoom-in-95 duration-300 space-y-6'>
                <div className='grid grid-cols-3 gap-4'>
                  <div className='bg-[var(--bg-card)] p-4 rounded-xl border border-white/5'>
                    <div className='text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1'>
                      Замовлень
                    </div>
                    <div className='text-2xl font-bold text-white'>
                      {orders.length}
                    </div>
                  </div>
                  <div className='bg-[var(--bg-card)] p-4 rounded-xl border border-white/5'>
                    <div className='text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1'>
                      Квитків
                    </div>
                    <div className='text-2xl font-bold text-white'>
                      {tickets.length}
                    </div>
                  </div>
                  <div className='bg-[var(--bg-card)] p-4 rounded-xl border border-white/5'>
                    <div className='text-[var(--text-muted)] text-xs uppercase tracking-wider mb-1'>
                      Витрачено
                    </div>
                    <div className='text-2xl font-bold text-[var(--color-primary)]'>
                      ₴{' '}
                      {orders
                        .filter(
                          o =>
                            String(o.status) !== 'Failed' &&
                            String(o.status) !== 'Cancelled',
                        )
                        .reduce((acc, o) => acc + o.totalAmount, 0)
                        .toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className='flex gap-4 border-b border-white/10'>
                  <button
                    type='button'
                    onClick={() => setActiveTab('orders')}
                    className={clsx(
                      'pb-3 px-2 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 outline-none',
                      activeTab === 'orders'
                        ? 'text-white border-[var(--color-primary)]'
                        : 'text-[var(--text-muted)] border-transparent hover:text-white',
                    )}
                  >
                    <LayoutList size={18} /> Історія замовлень
                  </button>
                  <button
                    type='button'
                    onClick={() => setActiveTab('tickets')}
                    className={clsx(
                      'pb-3 px-2 text-sm font-bold flex items-center gap-2 transition-colors border-b-2 outline-none',
                      activeTab === 'tickets'
                        ? 'text-white border-[var(--color-primary)]'
                        : 'text-[var(--text-muted)] border-transparent hover:text-white',
                    )}
                  >
                    <Ticket size={18} /> Всі квитки
                  </button>
                </div>

                <div className='bg-[var(--bg-card)] border border-white/5 rounded-xl overflow-hidden shadow-xl min-h-[300px]'>
                  {activeTab === 'orders' ? (
                    <table className='w-full text-left text-sm'>
                      <thead className='bg-white/5 text-[var(--text-muted)] font-medium uppercase text-xs'>
                        <tr>
                          <th className='px-6 py-4'>ID / Дата</th>
                          <th className='px-6 py-4'>Сума</th>
                          <th className='px-6 py-4'>Квитки</th>
                          <th className='px-6 py-4'>Статус</th>
                          <th className='px-6 py-4 text-right'>Дія</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-white/5'>
                        {orders.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className='p-8 text-center text-[var(--text-muted)]'
                            >
                              Історія замовлень порожня
                            </td>
                          </tr>
                        ) : (
                          orders.map(order => (
                            <tr
                              key={order.id}
                              className='hover:bg-white/5 transition-colors'
                            >
                              <td className='px-6 py-4'>
                                <div className='font-mono text-xs text-[var(--text-muted)] mb-1'>
                                  ORD-{order.id.slice(0, 6)}...
                                </div>
                                <div className='text-white flex items-center gap-2'>
                                  <Calendar
                                    size={12}
                                    className='text-[var(--color-primary)]'
                                  />
                                  {new Date(
                                    order.createdAt,
                                  ).toLocaleDateString()}
                                </div>
                              </td>
                              <td className='px-6 py-4 font-bold text-white'>
                                ₴ {order.totalAmount}
                              </td>
                              <td className='px-6 py-4 text-[var(--text-muted)]'>
                                {order.tickets.length} шт.
                              </td>
                              <td className='px-6 py-4'>
                                {getStatusBadge(String(order.status))}
                              </td>
                              <td className='px-6 py-4 text-right'>
                                {String(order.status).toLowerCase() ===
                                  'paid' ||
                                String(order.status).toLowerCase() ===
                                  'pending' ? (
                                  <button
                                    type='button'
                                    onClick={() => cancelOrder(order.id)}
                                    className='p-2 rounded hover:bg-red-500/10 text-red-500 transition-colors'
                                    title='Скасувати замовлення'
                                  >
                                    <Ban size={18} />
                                  </button>
                                ) : (
                                  <div className='w-8 h-8'></div>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <table className='w-full text-left text-sm'>
                      <thead className='bg-white/5 text-[var(--text-muted)] font-medium uppercase text-xs'>
                        <tr>
                          <th className='px-6 py-4'>Код</th>
                          <th className='px-6 py-4'>Фільм</th>
                          <th className='px-6 py-4'>Сеанс</th>
                          <th className='px-6 py-4'>Місце</th>
                          <th className='px-6 py-4'>Статус</th>
                          <th className='px-6 py-4 text-right'>Дія</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-white/5'>
                        {tickets.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className='p-8 text-center text-[var(--text-muted)]'
                            >
                              Квитків немає
                            </td>
                          </tr>
                        ) : (
                          tickets.map(ticket => (
                            <tr
                              key={ticket.id}
                              className='hover:bg-white/5 transition-colors'
                            >
                              <td className='px-6 py-4 font-mono text-xs text-white'>
                                {ticket.secretCode || ticket.id.slice(0, 8)}
                              </td>
                              <td className='px-6 py-4 text-white font-medium'>
                                {ticket.movieTitle}
                              </td>
                              <td className='px-6 py-4 text-[var(--text-muted)] text-xs'>
                                {new Date(ticket.sessionStart).toLocaleString()}
                              </td>
                              <td className='px-6 py-4 text-white'>
                                {ticket.hallName}{' '}
                                <span className='text-[var(--text-muted)] ml-1'>
                                  ({ticket.rowLabel}-{ticket.seatNumber})
                                </span>
                              </td>
                              <td className='px-6 py-4'>
                                {getStatusBadge(String(ticket.status))}
                              </td>
                              <td className='px-6 py-4 text-right'>
                                {String(ticket.status).toLowerCase() ===
                                  'valid' && (
                                  <button
                                    type='button'
                                    onClick={() => validateTicket(ticket.id)}
                                    className='p-2 rounded hover:bg-white/10 text-[var(--color-success)]'
                                    title='Валідувати (Сканувати)'
                                  >
                                    <CheckCircle2 size={18} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default UserActivityPage
