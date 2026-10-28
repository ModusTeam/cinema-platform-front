import { useEffect, useState } from 'react'
import Input from '@/shared/ui/Input'
import { FormDialog } from './FormDialog'

interface InputModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (value: string) => Promise<void> | void
  closeOnSubmit?: boolean
  title: string
  label?: string
  initialValue?: string
  placeholder?: string
  confirmText?: string
  type?: React.HTMLInputTypeAttribute
}

const InputModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  label,
  initialValue = '',
  placeholder = '',
  confirmText = 'Зберегти',
  type = 'text',
  closeOnSubmit = true,
}: InputModalProps) => {
  const [value, setValue] = useState(initialValue)
  useEffect(() => {
    if (isOpen) setValue(initialValue)
  }, [isOpen, initialValue])
  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      confirmText={confirmText}
      isDirty={value !== initialValue}
      submitDisabled={!value.trim()}
      onSubmit={async () => {
        await onSubmit(value)
        if (closeOnSubmit) onClose()
      }}
    >
      <Input
        type={type}
        label={label}
        value={value}
        onChange={event => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={label ? undefined : title}
      />
    </FormDialog>
  )
}

export default InputModal
