import { AlertTriangle, Coins } from 'lucide-react'

interface LoyaltyCheckoutCardProps {
	pointsBalance: number
	maxDiscount: number
	pointsLimit: number
	isLoading: boolean
	isDisabled: boolean
	errorMessage?: string
	disabledNote?: string
	isChecked: boolean
	onToggle: (value: boolean) => void
}

const LoyaltyCheckoutCard = ({
	pointsBalance,
	maxDiscount,
	pointsLimit,
	isLoading,
	isDisabled,
	errorMessage,
	disabledNote,
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
							{isLoading
								? 'Перевіряємо баланс'
								: `Доступно ${pointsBalance} балів`}
						</p>
					</div>
				</div>

				<label className='inline-flex items-center'>
					<input
						type='checkbox'
						className='h-4 w-4 accent-[var(--color-primary)]'
						checked={isChecked}
						onChange={event => onToggle(event.target.checked)}
						disabled={isDisabled}
						aria-label='Use loyalty points'
					/>
				</label>
			</div>

			<div className='mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-[var(--text-muted)]'>
				{isLoading ? (
					'Завантаження лояльності...'
				) : errorMessage ? (
					errorMessage
				) : (
					<>
						<div className='flex justify-between'>
							<span>Максимальна знижка</span>
							<span className='text-white'>{maxDiscount} ₴</span>
						</div>
						<div className='mt-2 flex justify-between'>
							<span>Ліміт балів</span>
							<span className='text-white'>{pointsLimit} балів</span>
						</div>
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
