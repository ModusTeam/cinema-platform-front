import { Loader2 } from 'lucide-react'
import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/shared/lib/utils'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'success'
  | 'ghost'

// Links can reuse appearance while retaining native navigation semantics.
export const buttonStyles = (variant: ButtonVariant = 'primary') =>
  `action action-${variant}`

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      isLoading = false,
      disabled,
      type = 'button',
      className,
      children,
      'aria-busy': busy,
      ...props
    },
    ref,
  ) => (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading ? true : busy}
      className={cn(buttonStyles(variant), className)}
    >
      {isLoading && (
        <Loader2
          size={16}
          aria-hidden='true'
          className='shrink-0 animate-spin motion-reduce:animate-none'
        />
      )}
      {children}
    </button>
  ),
)

Button.displayName = 'Button'
export default Button
