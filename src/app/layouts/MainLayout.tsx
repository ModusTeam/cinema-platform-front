import { clsx } from 'clsx'
import { motion } from 'motion/react'
import { Suspense } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import Footer from '@/app/layouts/components/Footer'
import Header from '@/app/layouts/components/Header'
import ScrollToTop from '@/app/ui/ScrollToTop'
import { usePresentation } from '@/features/presentation/model/PresentationContext'
import { useMotionPreference } from '@/shared/lib/useMotionPreference'
import { GridLoader } from '@/shared/ui/GridLoader'
import { ProgrammeFooter } from './components/ProgrammeFooter'
import { ProgrammeHeader } from './components/ProgrammeHeader'
import './programme.css'

const MainLayout = () => {
  const location = useLocation()
  const reducedMotion = useMotionPreference()
  const isHomePage = location.pathname === '/'
  const { presentation } = usePresentation()
  const isNewHome = isHomePage && presentation === 'new'

  const element = useOutlet()

  return (
    <div
      className={clsx(
        'flex min-h-screen supports-[min-height:100dvh]:min-h-dvh flex-col',
        isNewHome
          ? 'programme-shell relative z-[51] bg-[var(--signal-chalk)] font-programme-body text-base leading-normal text-[var(--signal-ink)] underline-offset-5 selection:bg-[var(--signal-yellow)] selection:text-[var(--signal-ink)] [&_a:hover]:underline [&_:is(a,button)]:focus-visible:outline-offset-4'
          : 'bg-[var(--bg-main)] text-[var(--text-main)] antialiased selection:bg-[var(--color-primary)]/30',
      )}
    >
      {isNewHome ? <ProgrammeHeader /> : <Header />}

      <ScrollToTop />
      <motion.main
        id='programme'
        key={location.pathname}
        initial={reducedMotion ? false : { opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.3, ease: 'easeOut' }}
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
      </motion.main>
      {isNewHome ? <ProgrammeFooter /> : <Footer />}
    </div>
  )
}

export default MainLayout
