import { Link } from 'react-router-dom'
import { useAuth } from '@/features/auth/model/AuthContext'
import { PresentationSwitch } from '@/features/presentation/ui/PresentationSwitch'

export function ProgrammeHeader() {
  const { user } = useAuth()
  return (
    <header className='programme-masthead'>
      <Link className='programme-brand' to='/' aria-label='vespre. — головна'>
        vespre.
      </Link>
      <nav aria-label='Головна навігація'>
        <a href='#programme' aria-current='page'>
          Фільми
        </a>
        <Link to='/sessions'>Розклад</Link>
        <Link to='/profile'>Квитки</Link>
      </nav>
      <div className='programme-account'>
        <Link to={user ? '/profile' : '/auth/login'}>
          {user ? 'Кабінет' : 'Увійти'}
        </Link>
        <PresentationSwitch />
      </div>
    </header>
  )
}
