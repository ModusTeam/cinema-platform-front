import { AlertTriangle, CircleArrowUp, Coins } from 'lucide-react'
import type { ComponentType } from 'react'

interface LoyaltyCheckoutCardProps {
  pointsBalance: number
  maxDiscount: number
  pointsLimit: number
  finalTotal: number
  isLoading: boolean
  isDisabled: boolean
  errorMessage?: string
  helperText?: string
  disabledNote?: string
  isChecked: boolean
  onToggle: (value: boolean) => void
  isGoldUpgradeAvailable?: boolean
  isGoldUpgradeChecked?: boolean
  goldUpgradeLabel?: string
  onGoldUpgradeToggle?: (value: boolean) => void
}

interface ActionableRowProps {
  icon: ComponentType<{ size?: number; className?: string }>
  label: string
  isChecked: boolean
  isDisabled?: boolean
  disabledNote?: string
  onToggle: (value: boolean) => void
}

const ActionableRow = ({
  icon: Icon,
  label,
  isChecked,
  isDisabled,
  disabledNote,
  onToggle,
}: ActionableRowProps) => (
  <button
    type='button'
    role='switch'
    aria-checked={isChecked}
    disabled={isDisabled}
    onClick={() => onToggle(!isChecked)}
    className={`flex w-full items-center justify-between gap-4 rounded-xl border p-3 text-left transition-colors ${
      isChecked
        ? 'border-red-600/80 bg-red-600/10'
        : 'border-white/10 bg-white/[0.03] hover:border-white/20'
    } ${isDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
  >
    <span className='flex min-w-0 items-center gap-3'>
      <span className='rounded-lg border border-white/10 bg-white/5 p-2 text-[var(--color-primary)]'>
        <Icon size={18} />
      </span>
      <span className='min-w-0'>
        <span className='block text-sm font-semibold text-white'>{label}</span>
        {disabledNote && (
          <span className='mt-1 flex items-center gap-1 text-[10px] text-amber-200'>
            <AlertTriangle size={12} />
            {disabledNote}
          </span>
        )}
      </span>
    </span>
    <span
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        isChecked ? 'bg-red-600' : 'bg-white/15'
      }`}
      aria-hidden='true'
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
          isChecked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </span>
  </button>
)

const LoyaltyCheckoutCard = ({
  pointsBalance,
  isLoading,
  isDisabled,
  errorMessage,
  disabledNote,
  isChecked,
  onToggle,
  isGoldUpgradeAvailable,
  isGoldUpgradeChecked = false,
  goldUpgradeLabel,
  onGoldUpgradeToggle,
}: LoyaltyCheckoutCardProps) => {
  const isGoldUpgradeMode = Boolean(isGoldUpgradeAvailable)
  const pointsDisabledNote =
    disabledNote || (isLoading ? 'Перевіряємо баланс' : undefined)
  const pointsRowDisabled = isDisabled || isLoading || Boolean(errorMessage)

  return (
    <div className='space-y-3'>
      {isGoldUpgradeMode && (
        <ActionableRow
          icon={CircleArrowUp}
          label='Оновити до VIP (+60 ₴)'
          isChecked={isGoldUpgradeChecked}
          isDisabled={!onGoldUpgradeToggle}
          disabledNote={goldUpgradeLabel}
          onToggle={value => onGoldUpgradeToggle?.(value)}
        />
      )}

      <ActionableRow
        icon={Coins}
        label={`Використати бали (Доступно: ${pointsBalance})`}
        isChecked={isChecked}
        isDisabled={pointsRowDisabled}
        disabledNote={errorMessage || pointsDisabledNote}
        onToggle={onToggle}
      />
    </div>
  )
}

export default LoyaltyCheckoutCard
