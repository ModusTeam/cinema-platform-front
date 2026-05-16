import { AlertTriangle, Coins } from 'lucide-react'

import type { LoyaltyCheckoutPreview } from '@/features/loyalty/api/loyalty.types'

interface LoyaltyCheckoutCardProps {
  preview?: LoyaltyCheckoutPreview
  isLoading: boolean
  isEnabled: boolean
  isChecked: boolean
  onToggle: (value: boolean) => void
}

const LoyaltyCheckoutCard = ({
  preview,
  isLoading,
  isEnabled,
  isChecked,
  onToggle,
}: LoyaltyCheckoutCardProps) => {
  return (
    <div className='rounded-2xl border border-white/10 bg-[var(--bg-main)]/40 p-4'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='rounded-xl border border-white/10 bg-white/5 p-2 text-[var(--color-primary)]'>
            <Coins size={18} />
          </div>
          <div>
            <div className='text-sm font-semibold text-white'>
              Використати бали лояльності
            </div>
            <p className='text-xs text-[var(--text-muted)]'>
              {preview
                ? `Доступно ${preview.availablePoints} балів`
                : 'Перевіряємо баланс'}
            </p>
          </div>
        </div>

        <label className='inline-flex items-center'>
          <input
            type='checkbox'
            className='h-4 w-4 accent-[var(--color-primary)]'
            checked={isChecked}
            onChange={event => onToggle(event.target.checked)}
            disabled={!isEnabled || isLoading}
            aria-label='Use loyalty points'
          />
        </label>
      </div>

      <div className='mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-[var(--text-muted)]'>
        {isLoading ? (
          'Завантаження лояльності...'
        ) : preview ? (
          <>
            <div className='flex justify-between'>
              <span>Максимальна знижка</span>
              <span className='text-white'>
                {preview.discountValue} ₴
              </span>
            </div>
            <div className='mt-2 flex justify-between'>
              <span>Ліміт балів</span>
              <span className='text-white'>
                {preview.maxRedeemablePoints} балів
              </span>
            </div>
            <div className='mt-3 flex items-start gap-2 text-[10px] text-amber-200'>
              <AlertTriangle size={14} className='mt-0.5' />
              <span>
                {isEnabled
                  ? 'Лояльність активна для цього замовлення.'
                  : preview.helperText}
              </span>
            </div>
          </>
        ) : (
          <span>Підключення лояльності ще в процесі.</span>
        )}
      </div>
    </div>
  )
}

export default LoyaltyCheckoutCard
