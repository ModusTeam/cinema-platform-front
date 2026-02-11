import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import { GridLoader } from '../../common/components/GridLoader'

const AdminRoute = () => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center bg-[var(--bg-main)] text-white'>
        <GridLoader className='animate-spin text-[var(--color-primary)]' />
      </div>
    )
  }

  if (user && user.role.toLowerCase() === 'admin') {
    return <Outlet />
  }

  return <Navigate to='/' replace />
}

export default AdminRoute
