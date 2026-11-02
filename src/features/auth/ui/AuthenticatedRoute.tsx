import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../model/AuthContext'

export default function AuthenticatedRoute() {
  const { user, isLoading } = useAuth()
  if (isLoading)
    return <output className='block px-5 py-16'>Завантажуємо профіль…</output>
  if (!user?.id) return <Navigate to='/auth/login' replace />
  return <Outlet />
}
