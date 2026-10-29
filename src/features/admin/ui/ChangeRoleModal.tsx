import { ShieldAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FormDialog } from '@/shared/ui/modals/FormDialog'
import type { UserDto } from '../api/admin-users.service'

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
  const [selectedRole, setSelectedRole] = useState<'Admin' | 'User'>(
    user.role === 'Admin' ? 'Admin' : 'User',
  )
  useEffect(() => {
    if (isOpen) setSelectedRole(user.role === 'Admin' ? 'Admin' : 'User')
  }, [isOpen, user.role])
  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title='Зміна ролі'
      description={`${user.email} · ${user.id}`}
      confirmText='Підтвердити зміну'
      isDirty={selectedRole !== user.role}
      submitDisabled={selectedRole === user.role}
      onSubmit={async () => {
        if (!(await onConfirm(user.id, selectedRole)))
          throw new Error(
            'Не вдалося змінити роль. Перевірте доступ і спробуйте ще раз.',
          )
        onClose()
      }}
    >
      <fieldset className='space-y-3'>
        <legend className='field-label mb-3'>Нова роль</legend>
        {(['User', 'Admin'] as const).map(role => (
          <label
            key={role}
            className='flex min-h-14 cursor-pointer items-center gap-3 rounded-md border border-[var(--border-default)] p-3 has-[:checked]:bg-[var(--bg-hover)]'
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
              {role}
              <span className='ml-3 text-[var(--text-muted)]'>
                {role === 'Admin' ? 'Повний доступ' : 'Звичайний доступ'}
              </span>
            </span>
          </label>
        ))}
      </fieldset>
      <p className='flex items-start gap-2 text-sm leading-relaxed text-[var(--color-warning)]'>
        <ShieldAlert size={18} className='mt-0.5 shrink-0' aria-hidden='true' />
        Зміна ролі змінює доступ до керування кінотеатром. Перевірте обрану роль
        перед підтвердженням.
      </p>
    </FormDialog>
  )
}
export default ChangeRoleModal
