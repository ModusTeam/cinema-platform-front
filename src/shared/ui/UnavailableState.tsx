import { AlertTriangle } from 'lucide-react'

import EmptyState from '@/shared/ui/EmptyState'

interface UnavailableStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

const UnavailableState = ({
  title = 'Не вдалося завантажити дані',
  description = 'Сервіс тимчасово недоступний. Спробуйте ще раз пізніше.',
  onRetry,
  className,
}: UnavailableStateProps) => (
  <EmptyState
    icon={<AlertTriangle className='h-12 w-12' />}
    title={title}
    description={description}
    actionLabel={onRetry ? 'Спробувати ще раз' : undefined}
    onAction={onRetry}
    className={className}
  />
)

export default UnavailableState
