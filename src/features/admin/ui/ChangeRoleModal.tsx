import { ShieldAlert, X } from 'lucide-react'
import { useId, useState } from 'react'
import type { UserDto } from '@/features/admin/api/admin-users.service'
import Button from '@/shared/ui/Button'
import { Dialog } from '@/shared/ui/modals/Dialog'

interface ChangeRoleModalProps {
  user: UserDto
  isOpen: boolean
  onClose: () => void
  onConfirm: (userId: string, newRole: 'Admin' | 'User') => Promise<boolean>
}

const ChangeRoleModal = ({
  user,
  isOpen,
  onClose,
  onConfirm,
}: ChangeRoleModalProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'Admin' | 'User'>(
    user.role === 'Admin' ? 'Admin' : 'User',
  )
  const id = useId()
  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isLoading || selectedRole === user.role) return
    setIsLoading(true)
    try {
      if (await onConfirm(user.id, selectedRole)) onClose()
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      isBusy={isLoading}
      titleId={`${id}-title`}
      descriptionId={`${id}-description`}
      className='font-public max-w-md rounded-lg p-6'
    >
      <div className='flex shrink-0 items-start justify-between gap-4 border-b border-[var(--border-default)] pb-4'>
        <h2 id={`${id}-title`} className='type-section font-medium'>
          Зміна ролі
        </h2>
        <Button
          variant='ghost'
          className='w-11 px-0'
          aria-label='Закрити діалог'
          onClick={onClose}
          disabled={isLoading}
        >
          <X size={18} />
        </Button>
      </div>
      <form onSubmit={handleSave} className='min-h-0 overflow-y-auto pt-5'>
        <p
          id={`${id}-description`}
          className='break-words text-sm text-[var(--text-muted)]'
        >
          Користувач:{' '}
          <span className='text-[var(--text-main)]'>{user.email}</span>
        </p>
        <fieldset disabled={isLoading} className='my-6 space-y-3'>
          <legend className='mb-3 text-sm font-medium'>Нова роль</legend>
          {(['User', 'Admin'] as const).map(role => (
            <label
              key={role}
              className='flex min-h-14 cursor-pointer items-center gap-3 rounded-md border border-[var(--border-default)] p-3 has-[:checked]:border-[var(--border-field)] has-[:checked]:bg-[var(--bg-hover)]'
            >
              <input
                type='radio'
                name='role'
                value={role}
                checked={selectedRole === role}
                onChange={() => setSelectedRole(role)}
                className='h-4 w-4 accent-[var(--color-primary)]'
              />
              <span className='text-sm'>
                {role}{' '}
                <span className='ml-3 text-[var(--text-muted)]'>
                  {role === 'Admin' ? 'Повний доступ' : 'Звичайний доступ'}
                </span>
              </span>
            </label>
          ))}
        </fieldset>
        <p className='mb-6 flex items-start gap-2 text-sm leading-relaxed text-[var(--color-warning)]'>
          <ShieldAlert
            size={18}
            className='mt-0.5 shrink-0'
            aria-hidden='true'
          />
          Зміна ролі змінює доступ до керування кінотеатром. Перевірте обрану
          роль перед підтвердженням.
        </p>
        <div className='flex justify-end gap-3 border-t border-[var(--border-default)] pt-4'>
          <Button
            variant='secondary'
            onClick={onClose}
            disabled={isLoading}
            data-modal-initial-focus
          >
            Скасувати
          </Button>
          <Button
            type='submit'
            isLoading={isLoading}
            disabled={selectedRole === user.role}
          >
            Підтвердити зміну
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

export default ChangeRoleModal
