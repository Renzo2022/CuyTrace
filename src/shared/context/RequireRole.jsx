import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'

export function RequireRole({ allowedRoles }) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />
  }

  if (!allowedRoles?.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
