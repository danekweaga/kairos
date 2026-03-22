import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "@/context/AuthContext"

export function PublicOnlyRoute() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return null
  }

  if (user) {
    if (profile?.onboarding_completed) {
      return <Navigate to="/home" replace />
    }
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
