import { useState } from 'react'

const BenefitSimulator = () => {
	const [tickets, setTickets] = useState('10')
	const [avgPrice, setAvgPrice] = useState('180')
	const [barSpend, setBarSpend] = useState('80')

	return (
		<div className='flex flex-col gap-8'>
			<div className='flex flex-col gap-1'>
				<h2 className='text-xl font-medium text-white'>Симулятор вигоди</h2>
				<p className='text-sm text-neutral-500'>
					Орієнтовні розрахунки без підключення бекенду
				</p>
			</div>

			<div className='grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-3'>
				<div className='flex flex-col gap-2'>
					<label className='text-xs tracking-wider text-neutral-500 uppercase'>
						Квитків на рік
					</label>
					<input
						type='number'
						value={tickets}
						onChange={e => setTickets(e.target.value)}
						className='border-b border-neutral-800 bg-transparent pb-1 text-2xl font-medium text-white transition-colors focus:border-neutral-500 focus:outline-none'
					/>
				</div>

				<div className='flex flex-col gap-2'>
					<label className='text-xs tracking-wider text-neutral-500 uppercase'>
						Середній чек квитка, ₴
					</label>
					<input
						type='number'
						value={avgPrice}
						onChange={e => setAvgPrice(e.target.value)}
						className='border-b border-neutral-800 bg-transparent pb-1 text-2xl font-medium text-white transition-colors focus:border-neutral-500 focus:outline-none'
					/>
				</div>

				<div className='flex flex-col gap-2'>
					<label className='text-xs tracking-wider text-neutral-500 uppercase'>
						Кінобар за відвідування, ₴
					</label>
					<input
						type='number'
						value={barSpend}
						onChange={e => setBarSpend(e.target.value)}
						className='border-b border-neutral-800 bg-transparent pb-1 text-2xl font-medium text-white transition-colors focus:border-neutral-500 focus:outline-none'
					/>
				</div>
			</div>
		</div>
	)
}

export default BenefitSimulator
