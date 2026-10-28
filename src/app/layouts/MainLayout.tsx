import { clsx } from 'clsx'
import { motion } from 'motion/react'
import { Suspense } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import Footer from '@/app/layouts/components/Footer'
import Header from '@/app/layouts/components/Header'
import ScrollToTop from '@/app/ui/ScrollToTop'
import { useMotionPreference } from '@/shared/lib/useMotionPreference'
import { GridLoader } from '@/shared/ui/GridLoader'

const MainLayout = () => {
  const location = useLocation()
  const reducedMotion = useMotionPreference()
  const isHomePage = location.pathname === '/'

  const element = useOutlet()

  return (
    <div className='flex min-h-screen flex-col bg-[var(--bg-main)] text-[var(--text-main)] antialiased selection:bg-[var(--color-primary)]/30'>
      <Header />

      <ScrollToTop />
      <motion.main
        key={location.pathname}
        initial={reducedMotion ? false : { opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.3, ease: 'easeOut' }}
        className={clsx(
          'flex-1 relative z-0',
          !isHomePage &&
            'pt-[calc(var(--public-header-height,5rem)+1rem)] md:pt-[calc(var(--public-header-height,5rem)+2rem)]',
        )}
      >
        <Suspense
          fallback={
            <div
              className={clsx(
                'flex w-full items-center justify-center',
                isHomePage ? 'min-h-svh' : 'h-[60vh]',
              )}
            >
              <GridLoader className='animate-spin text-[var(--color-primary)] h-12 w-12' />
            </div>
          }
        >
          {element}
        </Suspense>

        <Footer />
      </motion.main>
    </div>
  )
}

export default MainLayout
