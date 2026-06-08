import { AlertTriangle, Coins } from 'lucide-react'

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

const LoyaltyCheckoutCard = ({
  pointsBalance,
  maxDiscount,
  pointsLimit,
  finalTotal,
  isLoading,
  isDisabled,
  errorMessage,
  helperText,
  disabledNote,
  isChecked,
  onToggle,
  isGoldUpgradeAvailable,
  isGoldUpgradeChecked = false,
  goldUpgradeLabel,
  onGoldUpgradeToggle,
}: LoyaltyCheckoutCardProps) => {
  const isGoldUpgradeMode = Boolean(isGoldUpgradeAvailable)
  const isToggleDisabled = isDisabled || (isGoldUpgradeMode && !onGoldUpgradeToggle)
  const title = isGoldUpgradeMode
    ? 'Оновити місця до VIP'
    : 'Використати бали лояльності'
  const subtitle = isGoldUpgradeMode
    ? 'Доступно для рівня Gold — використайте бали для апгрейду місць'
    : isLoading
      ? 'Перевіряємо баланс'
      : `Доступно ${pointsBalance} балів`

  return (
    <div className='rounded-2xl border border-white/10 bg-[var(--bg-main)]/40 p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='rounded-xl border border-white/10 bg-white/5 p-2 text-[var(--color-primary)]'>
            <Coins size={18} />
          </div>
          <div>
            <div className='text-sm font-semibold text-white'>{title}</div>
            <p className='text-xs text-[var(--text-muted)]'>{subtitle}</p>
          </div>
        </div>

        <label className='inline-flex items-center'>
          <input
            type='checkbox'
            className='h-4 w-4 accent-[var(--color-primary)]'
            checked={
              isGoldUpgradeMode ? isGoldUpgradeChecked : isChecked
            }
            onChange={event =>
              isGoldUpgradeMode
                ? onGoldUpgradeToggle?.(event.target.checked)
                : onToggle(event.target.checked)
            }
            disabled={isToggleDisabled}
            aria-label={
              isGoldUpgradeMode
                ? 'Upgrade selected seats to VIP'
                : 'Use loyalty points'
            }
          />
        </label>
      </div>

      <div className='mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-[var(--text-muted)]'>
        {isLoading ? (
          'Завантаження лояльності...'
        ) : errorMessage ? (
          errorMessage
        ) : isGoldUpgradeMode ? (
          <>
            <p>
              Апгрейд буде застосовано до всіх обраних місць
            </p>
            {goldUpgradeLabel && (
              <p className='mt-2 text-[11px] text-amber-100'>
                {goldUpgradeLabel}
              </p>
            )}
            {disabledNote && (
              <div className='mt-3 flex items-start gap-2 text-[10px] text-amber-200'>
                <AlertTriangle size={14} className='mt-0.5' />
                <span>{disabledNote}</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className='flex justify-between'>
              <span>Максимальна знижка</span>
              <span className='text-white'>
                {maxDiscount > 0 ? `${maxDiscount} ₴` : 'Під час оплати'}
              </span>
            </div>
            <div className='mt-2 flex justify-between'>
              <span>Ліміт балів</span>
              <span className='text-white'>{pointsLimit} балів</span>
            </div>
            <div className='mt-2 flex justify-between'>
              <span>До сплати після знижки</span>
              <span className='text-white'>
                {maxDiscount > 0 ? `${finalTotal} ₴` : 'Буде уточнено'}
              </span>
            </div>
            {helperText && <p className='mt-3 text-[11px]'>{helperText}</p>}
            {disabledNote && (
              <div className='mt-3 flex items-start gap-2 text-[10px] text-amber-200'>
                <AlertTriangle size={14} className='mt-0.5' />
                <span>{disabledNote}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default LoyaltyCheckoutCard
