import { Navigate, Outlet, useLocation } from "react-router-dom"

import { useAuth } from "@/context/AuthContext"

export function PublicOnlyRoute() {
  const location = useLocation()
  const { user, profile, loading } = useAuth()
  const isResetRoute = location.pathname === "/reset-password"

  if (loading) {
    return null
  }

  if (isResetRoute) {
    return <Outlet />
  }

  if (user) {
    if (profile?.onboarding_completed) {
      return <Navigate to="/home" replace />
    }
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
