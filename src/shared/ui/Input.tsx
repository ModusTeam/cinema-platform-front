import { forwardRef, type InputHTMLAttributes, useId } from 'react'
import { cn } from '@/shared/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      id,
      'aria-describedby': describedBy,
      'aria-invalid': invalid,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const errorId = `${inputId}-error`
    const hintId = `${inputId}-hint`
    const descriptionIds =
      [describedBy, hint ? hintId : undefined, error ? errorId : undefined]
        .filter(Boolean)
        .join(' ') || undefined
    return (
      <div className='space-y-2'>
        {label && (
          <label htmlFor={inputId} className='field-label'>
            {label}
          </label>
        )}
        <input
          className={cn('field', className)}
          ref={ref}
          {...props}
          id={inputId}
          aria-invalid={error ? true : invalid}
          aria-describedby={descriptionIds}
        />
        {hint && (
          <p id={hintId} className='field-hint'>
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role='alert' className='field-error'>
            {error}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
export default Input
