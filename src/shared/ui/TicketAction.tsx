import { ArrowUpRight } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/shared/lib/utils'
import { buttonStyles } from './Button'
import './ticket-action.css'

const TicketAction = ({
  className,
  children,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    type={type}
    className={cn(buttonStyles(), 'ticket-action', className)}
  >
    <span className='ticket-action-label'>{children}</span>
    <span className='ticket-action-stub' aria-hidden='true'>
      <ArrowUpRight size={20} />
    </span>
  </button>
)

export default TicketAction
