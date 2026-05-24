import type { LoyaltyHistoryType } from '@/features/loyalty/api/loyalty.types'
import PointsHistoryTable from '@/features/loyalty/components/PointsHistoryTable'
import { useLoyaltyHistory } from '@/features/loyalty/hooks/useLoyaltyHistory'
import { clsx } from 'clsx'
import { ArrowLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type FilterType = LoyaltyHistoryType | 'all'

const FILTERS: { value: FilterType; label: string }[] = [
	{ value: 'all', label: 'Усі операції' },
	{ value: 'earn', label: 'Нарахування' },
	{ value: 'redeem', label: 'Списання' },
]

const LoyaltyHistoryPage = () => {
	const { items, hasMore, isLoading, isFetching, error, page, setPage } =
		useLoyaltyHistory()

	const [filter, setFilter] = useState<FilterType>('all')

	const filtered = useMemo(() => {
		if (filter === 'all') return items
		return items.filter(item => item.type === filter)
	}, [items, filter])

	return (
		<div className='relative min-h-screen overflow-hidden bg-[var(--bg-main)] text-[var(--text-main)]'>
			<div className='pointer-events-none absolute left-1/2 top-0 -z-10 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-white/[0.015] blur-[100px]' />

			<div className='relative mx-auto max-w-4xl space-y-12 px-4 pb-16 pt-28'>
				<Link
					to='/account/loyalty'
					className='group mb-8 flex w-fit items-center gap-2 text-sm text-[var(--text-muted)] transition-colors hover:text-white'
				>
					<ArrowLeft
						size={16}
						className='transition-transform group-hover:-translate-x-1'
					/>
					Назад до огляду
				</Link>

				<header className='flex flex-col gap-2'>
					<h1 className='text-3xl font-medium tracking-tight text-white md:text-4xl'>
						Історія транзакцій
					</h1>
					<p className='text-sm text-neutral-500'>
						Нарахування та використання балів лояльності
					</p>
				</header>

				<div className='flex items-center gap-8 border-b border-white/5'>
					{FILTERS.map(f => (
						<button
							key={f.value}
							onClick={() => setFilter(f.value)}
							className={clsx(
								'relative pb-4 text-sm transition-colors',
								filter === f.value
									? 'font-medium text-white'
									: 'text-neutral-500 hover:text-neutral-300',
							)}
						>
							{f.label}
							{filter === f.value && (
								<span className='absolute bottom-0 left-0 h-px w-full bg-white' />
							)}
						</button>
					))}
				</div>

				<PointsHistoryTable
					items={filtered}
					isLoading={isLoading && page === 1}
					isFetching={isFetching}
					hasMore={hasMore}
					error={error as Error | null}
					onLoadMore={() => setPage(page + 1)}
				/>
			</div>
		</div>
	)
}

export default LoyaltyHistoryPage
