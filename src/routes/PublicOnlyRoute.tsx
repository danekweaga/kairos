import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useEffect, useRef } from "react"

import { useAuth } from "@/context/AuthContext"

export function PublicOnlyRoute() {
  const location = useLocation()
  const { user, profile, loading } = useAuth()
  const isResetRoute = location.pathname === "/reset-password"
  const didLogRef = useRef(false)

  useEffect(() => {
    if (didLogRef.current) return
    didLogRef.current = true

    // #region agent log
    fetch("http://127.0.0.1:7813/ingest/5b4830d4-73b3-470d-a8be-4731797e0582", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f0655d" },
      body: JSON.stringify({
        sessionId: "f0655d",
        runId: "preflight-route",
        hypothesisId: "H1",
        location: "PublicOnlyRoute.tsx",
        message: "route_gate_state",
        data: {
          pathname: location.pathname,
          isResetRoute,
          userPresent: Boolean(user),
          onboardingCompleted: Boolean(profile?.onboarding_completed),
          loading,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
  }, [isResetRoute, location.pathname, loading, profile?.onboarding_completed, user])

  // Keep reset-password responsive even if global auth/profile initialization is still loading.
  if (isResetRoute) {
    return <Outlet />
  }

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
