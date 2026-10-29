import { clsx } from 'clsx'
import { Award, ChevronRight, History, User } from 'lucide-react'
import { useState } from 'react'
import type { UserDto } from '@/features/admin/api/admin-users.service'
import { useAdminLoyalty } from '@/features/admin/model/useAdminLoyalty'
import { useUsers } from '@/features/admin/model/useUsers'
import { AdminPageHeader } from '@/features/admin/ui/AdminPageHeader'
import ModifyLoyaltyModal from '@/features/admin/ui/ModifyLoyaltyModal'
import EmptyState from '@/shared/ui/EmptyState'
import { GridLoader } from '@/shared/ui/GridLoader'
import { useToast } from '@/shared/ui/toast/ToastContext'
import UnavailableState from '@/shared/ui/UnavailableState'

const AdminLoyaltyPage = () => {
  const toast = useToast()
  const {
    users: usersData,
    isLoading: isLoadingUsers,
    isError: isUsersError,
    refetch: refetchUsers,
  } = useUsers()
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const {
    balance,
    history,
    isLoadingBalance,
    isLoadingHistory,
    isBalanceError,
    isHistoryError,
    refetchBalance,
    refetchHistory,
    modifyPoints,
  } = useAdminLoyalty(selectedUser?.id)

  const handleModify = async (points: number, reason: string) => {
    if (!selectedUser) throw new Error('Оберіть користувача')
    await modifyPoints({ userId: selectedUser.id, points, reason })
    toast.success('Баланс успішно оновлено')
  }

  const userList: UserDto[] = usersData || []

  return (
    <div className='space-y-6'>
      <AdminPageHeader
        title='Лояльність'
        description='Баланс та історія операцій користувачів'
      />
      <div className='grid min-h-[34rem] h-[calc(100dvh-10rem)] grid-cols-[minmax(12rem,0.35fr)_minmax(0,1fr)] gap-5'>
        <div className='flex min-h-0 min-w-0 flex-col rounded-lg border border-[var(--border-default)] bg-[var(--surface-muted)]'>
          <div className='border-b border-white/5 p-6'>
            <h2 className='text-xl font-medium text-white'>Користувачі</h2>
            <p className='text-sm text-[var(--text-faint)] mt-1'>
              Оберіть для керування лояльністю
            </p>
          </div>

          <div className='flex-1 overflow-y-auto p-4 no-scrollbar'>
            {isLoadingUsers ? (
              <div className='flex justify-center py-10'>
                <GridLoader className='h-6 w-6 animate-spin text-[var(--color-primary)]' />
              </div>
            ) : isUsersError && userList.length === 0 ? (
              <UnavailableState
                onRetry={() => void refetchUsers()}
                className='border-0 bg-transparent px-3 py-10'
              />
            ) : userList.length === 0 ? (
              <EmptyState
                icon={<User className='h-10 w-10' />}
                title='Користувачів ще немає'
                description='Після реєстрації гостей їхні акаунти зʼявляться в цьому списку.'
                className='border-0 bg-transparent px-3 py-10'
              />
            ) : (
              <div className='flex flex-col gap-1'>
                {userList.map(user => (
                  <button
                    type='button'
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    aria-pressed={selectedUser?.id === user.id}
                    className={clsx(
                      'flex items-center justify-between rounded-xl p-3 text-left transition-colors',
                      selectedUser?.id === user.id
                        ? 'bg-white/10'
                        : 'hover:bg-white/5',
                    )}
                  >
                    <div className='min-w-0 break-words flex flex-col gap-0.5'>
                      <span className='text-sm font-medium text-white'>
                        {user.firstName} {user.lastName}
                      </span>
                      <span className='text-xs text-[var(--text-faint)]'>
                        {user.email}
                      </span>
                    </div>
                    <ChevronRight
                      size={16}
                      className={clsx(
                        'transition-transform',
                        selectedUser?.id === user.id
                          ? 'text-white'
                          : 'text-[var(--text-faint)]',
                      )}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Права панель: Деталі лояльності */}
        <div className='flex min-h-0 min-w-0 flex-col rounded-lg border border-[var(--border-default)] bg-[var(--surface-muted)]'>
          {!selectedUser ? (
            <EmptyState
              icon={<Award className='h-12 w-12' />}
              title='Оберіть користувача'
              description='Баланс, рівень лояльності та історія операцій зʼявляться після вибору акаунту.'
              className='h-full border-0 bg-transparent'
            />
          ) : isBalanceError && !balance ? (
            <UnavailableState
              title='Баланс тимчасово недоступний'
              onRetry={() => void refetchBalance()}
              className='h-full border-0 bg-transparent'
            />
          ) : (
            <>
              <div className='flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border-default)] p-5'>
                <div className='flex flex-col gap-1'>
                  <h2 className='text-xl font-medium text-white'>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h2>
                  <div className='flex items-center gap-2 text-sm text-[var(--text-faint)]'>
                    <span>ID: {selectedUser.id.split('-')[0]}</span>
                    {isLoadingBalance ? (
                      <span className='h-4 w-16 animate-pulse rounded bg-white/10' />
                    ) : (
                      <span className='rounded bg-white/5 px-2 py-0.5 text-xs tracking-widest text-white uppercase'>
                        {balance?.tier || 'N/A'}
                      </span>
                    )}
                  </div>
                </div>

                <div className='flex items-center gap-6'>
                  <div className='flex flex-col items-end gap-1'>
                    <span className='text-xs tracking-widest text-[var(--text-faint)] uppercase'>
                      Баланс
                    </span>
                    {isLoadingBalance ? (
                      <div className='h-8 w-20 animate-pulse rounded bg-white/10' />
                    ) : (
                      <span className='text-2xl font-medium text-white'>
                        {balance?.balance ?? 0}
                      </span>
                    )}
                  </div>
                  <div className='h-10 w-px bg-white/10' />
                  <button
                    type='button'
                    onClick={() => setIsModalOpen(true)}
                    className='rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20'
                  >
                    Змінити баланс
                  </button>
                </div>
              </div>

              <div className='flex-1 overflow-y-auto p-6 no-scrollbar'>
                <h3 className='mb-6 text-sm font-medium text-neutral-400'>
                  Історія транзакцій
                </h3>

                {isLoadingHistory ? (
                  <div className='flex flex-col gap-4'>
                    {['balance-1', 'balance-2', 'balance-3', 'balance-4'].map(
                      key => (
                        <div
                          key={key}
                          className='h-16 w-full animate-pulse rounded-lg bg-white/5'
                        />
                      ),
                    )}
                  </div>
                ) : isHistoryError && !history ? (
                  <UnavailableState
                    title='Історія тимчасово недоступна'
                    onRetry={() => void refetchHistory()}
                    className='border-0 bg-transparent py-12'
                  />
                ) : !history || history.length === 0 ? (
                  <EmptyState
                    icon={<History className='h-12 w-12' />}
                    title='Транзакцій ще немає'
                    description='Нарахування, списання та ручні коригування балансу відображатимуться тут.'
                    className='border-0 bg-transparent py-12'
                  />
                ) : (
                  <div className='flex flex-col'>
                    {history.map(tx => (
                      <div
                        key={tx.id}
                        className='flex items-center justify-between border-b border-white/5 py-4 last:border-0'
                      >
                        <div className='flex flex-col gap-1'>
                          <span className='text-sm font-medium text-white'>
                            {tx.description}
                          </span>
                          <span className='text-xs text-[var(--text-faint)]'>
                            {new Date(tx.createdAt).toLocaleString('uk-UA')} ·{' '}
                            {tx.type}
                          </span>
                        </div>
                        <div className='flex flex-col items-end gap-1'>
                          <span
                            className={clsx(
                              'text-sm font-medium',
                              tx.points > 0
                                ? 'text-emerald-400'
                                : 'text-rose-400',
                            )}
                          >
                            {tx.points > 0 ? '+' : ''}
                            {tx.points}
                          </span>
                          <span className='text-xs text-[var(--text-faint)]'>
                            Залишок: {tx.balanceAfter}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <ModifyLoyaltyModal
          key={selectedUser?.id ?? 'no-user'}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModify}
          userName={`${selectedUser?.firstName ?? ''} ${selectedUser?.lastName ?? ''} · ${selectedUser?.email ?? ''} · ${selectedUser?.id ?? ''}`}
        />
      </div>
    </div>
  )
}

export default AdminLoyaltyPage
