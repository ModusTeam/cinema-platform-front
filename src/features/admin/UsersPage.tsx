import { useState, useMemo } from 'react'
import { useUsers } from './hooks/useUsers'
import {
  Search,
  User as UserIcon,
  MoreHorizontal,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { GridLoader } from '../../common/components/GridLoader'
import { useAuth } from '../auth/AuthContext'
import ChangeRoleModal from './components/ChangeRoleModal'
import { type UserDto } from '../../services/adminUsersService'

const UsersPage = () => {
  const { user: currentUser } = useAuth()

  const { users, isLoading, changeUserRole, pagination, changePage } =
    useUsers()

  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserDto | null>(null)

  const filteredUsers = useMemo(() => {
    if (!users) return []
    const lowerQuery = searchQuery.toLowerCase()

    return users.filter(
      u =>
        (u.email?.toLowerCase() || '').includes(lowerQuery) ||
        (u.firstName?.toLowerCase() || '').includes(lowerQuery) ||
        (u.lastName?.toLowerCase() || '').includes(lowerQuery),
    )
  }, [searchQuery, users])

  const handleEditClick = (user: UserDto) => {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  const onConfirmRoleChange = async (
    userId: string,
    newRole: 'Admin' | 'User',
  ) => {
    const result = await changeUserRole(userId, newRole)
    if (result.success) {
      console.log(`Роль змінено на ${newRole}`)
    } else {
      alert(result.error)
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.charAt(0) || ''
    const last = lastName?.charAt(0) || ''
    return (first + last).toUpperCase() || 'U'
  }

  return (
    <div className='space-y-6 pb-20'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-white'>Користувачі</h1>
          <p className='text-[var(--text-muted)] mt-1'>
            Управління доступом та ролями
          </p>
        </div>
        <div className='text-sm text-[var(--text-muted)]'>
          Всього:{' '}
          <span className='text-white font-bold'>{pagination.totalCount}</span>
        </div>
      </div>

      <div className='relative'>
        <Search
          className='absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]'
          size={20}
        />
        <input
          type='text'
          placeholder="Фільтр на сторінці (ім'я або email)..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className='w-full rounded-xl bg-[var(--bg-card)] border border-white/5 py-3 pl-10 pr-4 text-white placeholder-[var(--text-muted)] focus:border-[var(--color-primary)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/50'
        />
      </div>

      {isLoading ? (
        <div className='flex justify-center py-20'>
          <GridLoader className='animate-spin text-[var(--color-primary)] h-8 w-8' />
        </div>
      ) : (
        <>
          <div className='rounded-xl border border-white/5 bg-[var(--bg-card)] overflow-hidden backdrop-blur-sm shadow-xl'>
            <table className='w-full text-left text-sm'>
              <thead className='bg-white/5 text-[var(--text-muted)] font-medium uppercase text-xs tracking-wider'>
                <tr>
                  <th className='px-6 py-4'>Користувач</th>
                  <th className='px-6 py-4'>Роль</th>
                  <th className='px-6 py-4 text-right'>Дії</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-white/5'>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className='px-6 py-12 text-center text-[var(--text-muted)]'
                    >
                      {users.length === 0
                        ? 'Список користувачів порожній'
                        : 'За вашим запитом нікого не знайдено на цій сторінці'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => {
                    const isMe = currentUser?.id === user.id
                    const isAdmin = user.role === 'Admin'
                    const initials = getInitials(user.firstName, user.lastName)

                    return (
                      <tr
                        key={user.id}
                        className='group hover:bg-[var(--bg-hover)] transition-colors'
                      >
                        <td className='px-6 py-4'>
                          <div className='flex items-center gap-4'>
                            <div
                              className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner shrink-0 ${isAdmin ? 'bg-gradient-to-br from-[var(--color-primary)] to-red-900' : 'bg-white/10'}`}
                            >
                              {initials}
                            </div>
                            <div className='overflow-hidden'>
                              <div className='font-bold text-white flex items-center gap-2 truncate'>
                                {user.firstName} {user.lastName}
                                {isMe && (
                                  <span className='text-[10px] bg-white/10 px-1.5 rounded text-[var(--text-muted)]'>
                                    Ви
                                  </span>
                                )}
                              </div>
                              <div className='text-[var(--text-muted)] text-xs truncate'>
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4'>
                          {isAdmin ? (
                            <span className='inline-flex items-center gap-1.5 rounded-full bg-[var(--color-primary)]/10 px-3 py-1 text-xs font-bold text-[var(--color-primary)] border border-[var(--color-primary)]/20'>
                              <ShieldCheck size={12} /> Admin
                            </span>
                          ) : (
                            <span className='inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-[var(--text-muted)] border border-white/10'>
                              <UserIcon size={12} /> User
                            </span>
                          )}
                        </td>
                        <td className='px-6 py-4 text-right'>
                          <button
                            type='button'
                            onClick={() => handleEditClick(user)}
                            disabled={isMe}
                            className='p-2 rounded-lg text-[var(--text-muted)] hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all'
                          >
                            <MoreHorizontal size={20} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className='flex items-center justify-between mt-4 px-2'>
            <div className='text-sm text-[var(--text-muted)]'>
              Сторінка{' '}
              <span className='text-white font-bold'>
                {pagination.pageNumber}
              </span>{' '}
              з {pagination.totalPages}
            </div>

            <div className='flex gap-2'>
              <button
                type='button'
                onClick={() => changePage(pagination.pageNumber - 1)}
                disabled={!pagination.hasPreviousPage}
                className='p-2 rounded-lg bg-[var(--bg-card)] border border-white/10 text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type='button'
                onClick={() => changePage(pagination.pageNumber + 1)}
                disabled={!pagination.hasNextPage}
                className='p-2 rounded-lg bg-[var(--bg-card)] border border-white/10 text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </>
      )}

      <ChangeRoleModal
        isOpen={isModalOpen}
        user={editingUser}
        onClose={() => setIsModalOpen(false)}
        onConfirm={onConfirmRoleChange}
      />
    </div>
  )
}

export default UsersPage
