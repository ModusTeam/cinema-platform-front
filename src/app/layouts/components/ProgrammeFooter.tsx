import { Link } from 'react-router-dom'

export function ProgrammeFooter() {
  return (
    <footer className='programme-footer'>
      <Link className='programme-brand' to='/'>
        vespre.
      </Link>
      <nav aria-label='Інформація про кінотеатр'>
        <Link to='/about'>Про нас</Link>
        <Link to='/faq'>Допомога</Link>
        <Link to='/rules'>Правила</Link>
        <Link to='/privacy'>Конфіденційність</Link>
      </nav>
      <span>© {new Date().getFullYear()} vespre.</span>
    </footer>
  )
}
