import { Suspense } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion, type Variants } from 'motion/react'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from '../common/components/ScrollToTop'
import { clsx } from 'clsx'
import { GridLoader } from '../common/components/GridLoader'

const pageVariants: Variants = {
	initial: {
		opacity: 0,
		y: 20,
		scale: 0.99,
		filter: 'blur(4px)',
	},
	animate: {
		opacity: 1,
		y: 0,
		scale: 1,
		filter: 'blur(0px)',
		transition: {
			duration: 0.5,
			ease: [0.25, 0.1, 0.25, 1.0],
		},
	},
	exit: {
		opacity: 0,
		y: -20,
		scale: 0.99,
		filter: 'blur(2px)',
		transition: {
			duration: 0.3,
			ease: 'easeIn',
		},
	},
}

const MainLayout = () => {
	const location = useLocation()
	const isHomePage = location.pathname === '/'

	const element = useOutlet()

	return (
		<div className='flex min-h-screen flex-col bg-[var(--bg-main)] text-[var(--text-main)] antialiased selection:bg-[var(--color-primary)]/30'>
			<Header />

			<AnimatePresence mode='wait' initial={false}>
				<ScrollToTop />
				<motion.main
					key={location.pathname}
					variants={pageVariants}
					initial='initial'
					animate='animate'
					exit='exit'
					className={clsx('flex-1 relative z-0', !isHomePage && 'pt-24 md:pt-28')}
				>
					<Suspense
						fallback={
							<div className='flex h-[60vh] w-full items-center justify-center'>
								<GridLoader className='animate-spin text-[var(--color-primary)] h-12 w-12' />
							</div>
						}
					>
						{element}
					</Suspense>

					<Footer />
				</motion.main>
			</AnimatePresence>
		</div>
	)
}

export default MainLayout
