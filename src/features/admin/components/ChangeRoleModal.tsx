import { useState } from 'react'
import { X, Shield, ShieldAlert, Check } from 'lucide-react'
import { GridLoader } from '../../../common/components/GridLoader'
import type { UserDto } from '../../../services/adminUsersService'

interface ChangeRoleModalProps {
  user: UserDto | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (userId: string, newRole: 'Admin' | 'User') => Promise<void>
}

const ChangeRoleModal = ({
  user,
  isOpen,
  onClose,
  onConfirm,
}: ChangeRoleModalProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'Admin' | 'User'>('User')

  if (!isOpen || !user) return null

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onConfirm(user.id, selectedRole)
      onClose()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200'>
      <div className='w-full max-w-md rounded-xl border border-white/10 bg-[var(--bg-card)] p-6 shadow-2xl animate-in zoom-in-95'>
        <div className='flex justify-between items-start mb-6'>
          <div>
            <h2 className='text-xl font-bold text-white'>Зміна ролі</h2>
            <p className='text-[var(--text-muted)] text-sm mt-1'>
              Користувач: <span className='text-white'>{user.email}</span>
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='text-[var(--text-muted)] hover:text-white'
          >
            <X size={20} />
          </button>
        </div>

        <div className='grid grid-cols-2 gap-4 mb-8'>
          <div
            onClick={() => setSelectedRole('User')}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              selectedRole === 'User'
                ? 'bg-white text-black border-white'
                : 'bg-[var(--bg-main)] border-white/5 hover:border-white/20 text-[var(--text-muted)]'
            }`}
          >
            <div className='flex justify-between items-start'>
              <Shield
                size={24}
                className={
                  selectedRole === 'User' ? 'text-black' : 'text-zinc-600'
                }
              />
              {selectedRole === 'User' && (
                <Check size={16} className='text-black' />
              )}
            </div>
            <div className='mt-3 font-bold'>User</div>
            <div
              className={`text-xs mt-1 ${selectedRole === 'User' ? 'text-zinc-600' : 'text-[var(--text-muted)]'}`}
            >
              Звичайний доступ
            </div>
          </div>

          <div
            onClick={() => setSelectedRole('Admin')}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              selectedRole === 'Admin'
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                : 'bg-[var(--bg-main)] border-white/5 hover:border-[var(--color-primary)]/50 text-[var(--text-muted)]'
            }`}
          >
            <div className='flex justify-between items-start'>
              <ShieldAlert
                size={24}
                className={
                  selectedRole === 'Admin' ? 'text-white' : 'text-zinc-600'
                }
              />
              {selectedRole === 'Admin' && (
                <Check size={16} className='text-white' />
              )}
            </div>
            <div className='mt-3 font-bold'>Admin</div>
            <div
              className={`text-xs mt-1 ${selectedRole === 'Admin' ? 'text-white/80' : 'text-[var(--text-muted)]'}`}
            >
              Повний доступ
            </div>
          </div>
        </div>

        <div className='flex gap-3 justify-end'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 text-[var(--text-muted)] hover:text-white text-sm font-medium'
          >
            Скасувати
          </button>
          <button
            type='button'
            onClick={handleSave}
            disabled={isLoading || selectedRole === user.role}
            className='px-6 py-2 bg-white text-black rounded-lg font-bold text-sm hover:bg-zinc-200 disabled:opacity-50 flex items-center gap-2'
          >
            {isLoading && <GridLoader size={16} className='animate-spin' />}
            Зберегти
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChangeRoleModal
