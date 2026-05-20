import { ArrowRight, BadgeCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import LoyaltyDashboard from '@/features/loyalty/components/LoyaltyDashboard'

const LoyaltyPage = () => {
	return (
		<div className='min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]'>
			<div className='container mx-auto max-w-6xl px-4 pt-28 pb-16 space-y-10'>
				<header className='space-y-4'>
					<div className='flex items-center gap-3 text-[var(--color-primary)]'>
						<BadgeCheck size={20} />
						<span className='text-xs uppercase tracking-widest font-bold'>
							Програма лояльності
						</span>
					</div>
					<div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
						<div>
							<h1 className='text-4xl md:text-5xl font-black text-white uppercase tracking-tighter'>
								Loyalty & Achievements
							</h1>
							<p className='mt-3 text-[var(--text-muted)] max-w-2xl'>
								Огляд балансу, рівнів та бонусів. Дані синхронізуються з вашим
								профілем лояльності.
							</p>
						</div>
						<Link
							to='/account/loyalty/history'
							className='inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10'
						>
							Переглянути історію <ArrowRight size={16} />
						</Link>
					</div>
				</header>

				<LoyaltyDashboard />
			</div>
		</div>
	)
}

export default LoyaltyPage
