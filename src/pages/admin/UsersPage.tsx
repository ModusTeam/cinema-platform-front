import { Search, ShieldCheck, User as UserIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { UserDto } from '@/features/admin/api/admin-users.service'
import { useUsers } from '@/features/admin/model/useUsers'
import { AdminPageHeader } from '@/features/admin/ui/AdminPageHeader'
import { AdminPagination } from '@/features/admin/ui/AdminPagination'
import { AdminTable } from '@/features/admin/ui/AdminTable'
import ChangeRoleModal from '@/features/admin/ui/ChangeRoleModal'
import { useAuth } from '@/features/auth/model/AuthContext'
import Button from '@/shared/ui/Button'
import EmptyState from '@/shared/ui/EmptyState'
import { GridLoader } from '@/shared/ui/GridLoader'
import Input from '@/shared/ui/Input'
import { useToast } from '@/shared/ui/toast/ToastContext'
import UnavailableState from '@/shared/ui/UnavailableState'

const USERS_PER_PAGE = 10

const UsersPage = () => {
  const { user: currentUser } = useAuth()
  const { users, isLoading, isError, refetch, changeUserRole } = useUsers()
  const toast = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [editingUser, setEditingUser] = useState<UserDto | null>(null)
  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase()
    return users.filter(user =>
      [user.email, user.firstName, user.lastName].some(value =>
        (value?.toLowerCase() || '').includes(query),
      ),
    )
  }, [searchQuery, users])
  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / USERS_PER_PAGE),
  )
  const currentPage = Math.min(page, totalPages)
  const pageUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE,
  )
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setPage(1)
  }
  const onConfirmRoleChange = async (
    userId: string,
    newRole: 'Admin' | 'User',
  ) => {
    if (currentUser?.id === userId) return false
    const result = await changeUserRole(userId, newRole)
    if (!result.success) {
      toast.error(result.error || 'Помилка зміни ролі')
      return false
    }
    toast.success('Роль користувача оновлено')
    return true
  }

  return (
    <div className='space-y-6 pb-10'>
      <AdminPageHeader
        title='Користувачі'
        description='Управління доступом та ролями'
      >
        {!isLoading && !isError && (
          <span className='text-sm tabular-nums text-[var(--text-muted)]'>
            Всього:{' '}
            <span className='text-[var(--text-main)]'>{users.length}</span>
          </span>
        )}
      </AdminPageHeader>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div className='relative w-full max-w-sm'>
          <Search
            size={17}
            aria-hidden='true'
            className='pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)]'
          />
          <Input
            type='search'
            aria-label="Пошук за ім'ям або email"
            placeholder="Пошук за ім'ям або email…"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            className='pl-10'
          />
        </div>
        <p className='text-xs text-[var(--text-muted)]'>
          Власну роль змінити неможливо
        </p>
      </div>
      {isLoading ? (
        <output className='flex justify-center py-20'>
          <GridLoader
            aria-hidden='true'
            className='h-8 w-8 animate-spin motion-reduce:animate-none text-[var(--text-muted)]'
          />
          <span className='sr-only'>Завантаження користувачів</span>
        </output>
      ) : isError && users.length === 0 ? (
        <UnavailableState onRetry={() => void refetch()} />
      ) : (
        <>
          {isError && (
            <UnavailableState
              title='Не вдалося оновити користувачів'
              description='Показано раніше завантажені дані.'
              onRetry={() => void refetch()}
            />
          )}
          <AdminTable label='Користувачі та ролі'>
            <table className='min-w-[620px]'>
              <caption className='sr-only'>
                Користувачі та керування доступом
              </caption>
              <thead>
                <tr>
                  <th scope='col'>Користувач</th>
                  <th scope='col'>Роль</th>
                  <th scope='col'>Доступ</th>
                </tr>
              </thead>
              <tbody>
                {pageUsers.length === 0 ? (
                  <tr>
                    <td colSpan={3}>
                      <EmptyState
                        icon={<UserIcon className='h-12 w-12' />}
                        title={
                          users.length === 0
                            ? 'Користувачів ще немає'
                            : 'Користувачів за фільтром немає'
                        }
                        description={
                          users.length === 0
                            ? 'Нові акаунти зʼявляться тут після реєстрації гостей.'
                            : 'Очистьте фільтр, щоб побачити всіх користувачів.'
                        }
                        actionLabel={
                          searchQuery ? 'Очистити фільтр' : undefined
                        }
                        onAction={
                          searchQuery ? () => handleSearchChange('') : undefined
                        }
                        className='border-0 bg-transparent py-12'
                      />
                    </td>
                  </tr>
                ) : (
                  pageUsers.map(user => {
                    const isMe = currentUser?.id === user.id
                    const isAdmin = user.role === 'Admin'
                    return (
                      <tr key={user.id}>
                        <th
                          scope='row'
                          className='!bg-transparent !whitespace-normal !font-normal'
                        >
                          <div className='flex items-center gap-3'>
                            <div
                              aria-hidden='true'
                              className='flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[var(--bg-card)] text-xs text-[var(--text-muted)]'
                            >
                              {(
                                (user.firstName?.charAt(0) || '') +
                                (user.lastName?.charAt(0) || '')
                              ).toUpperCase() || 'U'}
                            </div>
                            <div className='min-w-0 max-w-sm break-words'>
                              <p className='text-sm font-medium text-[var(--text-main)]'>
                                {user.firstName} {user.lastName}
                                {isMe && (
                                  <span className='ml-2 text-xs font-normal text-[var(--text-faint)]'>
                                    Ви
                                  </span>
                                )}
                              </p>
                              <p className='mt-1 text-xs text-[var(--text-muted)]'>
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </th>
                        <td>
                          <span className='inline-flex items-center gap-2 text-xs text-[var(--text-muted)]'>
                            {isAdmin && (
                              <ShieldCheck size={15} aria-hidden='true' />
                            )}
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <Button
                            variant='ghost'
                            onClick={() => setEditingUser(user)}
                            disabled={isMe}
                            aria-label={`Змінити роль: ${user.email}`}
                            className='whitespace-nowrap px-3'
                          >
                            <ShieldCheck size={15} aria-hidden='true' />
                            Змінити роль
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </AdminTable>
          <AdminPagination
            pageNumber={currentPage}
            pageSize={USERS_PER_PAGE}
            totalCount={filteredUsers.length}
            hasPreviousPage={currentPage > 1}
            hasNextPage={currentPage < totalPages}
            onPageChange={setPage}
          />
        </>
      )}
      {editingUser && (
        <ChangeRoleModal
          key={editingUser.id}
          isOpen
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onConfirm={onConfirmRoleChange}
        />
      )}
    </div>
  )
}

export default UsersPage
