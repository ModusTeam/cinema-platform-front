import { Link } from 'react-router-dom'
import {
  FOOTER_CINEMA_LINKS,
  FOOTER_LEGAL_LINKS,
  FOOTER_PRIMARY_LINKS,
} from './navigation.config'
import './footer.css'

const Footer = () => (
  <footer className='cinema-footer relative z-10 border-t border-[var(--border-default)] bg-[var(--bg-main)] font-public text-[var(--text-main)]'>
    <div className='mx-auto max-w-[1600px] px-4 pb-6 pt-12 md:px-8 md:pt-16'>
      <div className='grid min-w-0 gap-10 pb-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16 lg:pb-16'>
        <nav aria-label='Кіно та квитки'>
          <ul className='space-y-2'>
            {FOOTER_PRIMARY_LINKS.map(item => (
              <li key={item.href}>
                <Link className='footer-primary-link' to={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className='grid min-w-0 gap-8 sm:grid-cols-2'>
          <nav aria-label='Кінотеатр'>
            <ul>
              {FOOTER_CINEMA_LINKS.map(item => (
                <li key={item.href}>
                  <Link className='footer-link' to={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label='Інформація та допомога'>
            <ul>
              <li>
                <Link className='footer-link' to='/faq'>
                  Часті запитання
                </Link>
              </li>
              <li>
                <a
                  className='footer-link'
                  href='https://modusteam.github.io/cinema-platform-docs/'
                  target='_blank'
                  rel='noreferrer'
                >
                  API Документація
                  <span className='sr-only'> (у новій вкладці)</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <div className='flex min-w-0 flex-wrap items-start justify-between gap-x-10 gap-y-6 border-t border-[var(--border-default)] py-6'>
        <Link
          to='/'
          aria-label='Cinema — на головну'
          className='inline-flex min-h-11 items-center font-sans text-3xl font-black uppercase tracking-tighter'
        >
          Cine<span className='text-[var(--color-primary)]'>ma</span>.
        </Link>
        <nav aria-label='Правова інформація'>
          <ul className='flex flex-wrap gap-x-6'>
            {FOOTER_LEGAL_LINKS.map(item => (
              <li key={item.href}>
                <Link className='footer-link text-sm' to={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className='text-xs leading-relaxed text-[var(--text-faint)]'>
        © {new Date().getFullYear()} Cinema Platform. Усі права захищено.
      </p>
    </div>
  </footer>
)

export default Footer
