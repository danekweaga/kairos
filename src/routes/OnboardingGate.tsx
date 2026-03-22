import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "@/context/AuthContext"

export function OnboardingGate() {
  const { profile, loading } = useAuth()

  if (loading) {
    return null
  }

  if (!profile?.onboarding_completed) {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}
