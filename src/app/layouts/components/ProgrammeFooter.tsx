import { Link } from 'react-router-dom'
import { ProgrammeBrand } from './ProgrammeBrand'

export function ProgrammeFooter() {
  return (
    <footer className='programme-footer flex shrink-0 flex-col items-start gap-6 bg-[var(--signal-ink)] px-4 py-8 text-[var(--signal-chalk)] [--focus-ring:var(--signal-chalk)] md:flex-row md:flex-wrap md:items-center md:gap-8 md:px-8 md:py-10 min-[100rem]:px-[max(32px,calc((100vw-1472px)/2))]'>
      <ProgrammeBrand />
      <nav
        aria-label='Інформація про кінотеатр'
        className='flex min-w-0 flex-wrap items-center gap-6'
      >
        <Link to='/about'>Про нас</Link>
        <Link to='/faq'>Допомога</Link>
        <Link to='/rules'>Правила</Link>
        <Link to='/privacy'>Конфіденційність</Link>
      </nav>
      <span className='min-w-0 text-sm md:ml-auto'>
        © {new Date().getFullYear()} vespre.
      </span>
    </footer>
  )
}
