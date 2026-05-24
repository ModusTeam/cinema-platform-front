interface BalanceWidgetProps {
	pointsBalance: number
	updatedAt: string
}

const BalanceWidget = ({ pointsBalance, updatedAt }: BalanceWidgetProps) => {
	const updatedDate = new Date(updatedAt)

	return (
		<div className='flex w-full flex-col gap-4 md:w-1/2'>
			<div className='flex flex-col gap-1'>
				<span className='text-sm tracking-widest text-neutral-500 uppercase'>
					Баланс
				</span>
				<div className='flex items-baseline gap-2'>
					<h2 className='text-3xl font-medium text-white'>{pointsBalance}</h2>
					<span className='text-sm text-neutral-500'>балів</span>
				</div>
			</div>
			<p className='text-sm text-neutral-400'>
				Оновлено {updatedDate.toLocaleDateString('uk-UA')}. Використовуйте бали
				для майбутніх бронювань та бонусів.
			</p>
		</div>
	)
}

export default BalanceWidget
