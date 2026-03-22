import { Navigate, Route, Routes } from "react-router-dom"

import { AuthStatusBoundary } from "@/components/AuthStatusBoundary"
import { OnboardingGate } from "@/routes/OnboardingGate"
import { ProtectedRoute } from "@/routes/ProtectedRoute"
import { PublicOnlyRoute } from "@/routes/PublicOnlyRoute"
import { DashboardPage } from "@/pages/DashboardPage"
import { FocusSessionPage } from "@/pages/FocusSessionPage"
import { HomePage } from "@/pages/HomePage"
import { LandingPage } from "@/pages/LandingPage"
import { LoginPage } from "@/pages/LoginPage"
import { OnboardingPage } from "@/pages/OnboardingPage"
import { ResetPasswordPage } from "@/pages/ResetPasswordPage"
import { SignupPage } from "@/pages/SignupPage"

function App() {
  return (
    <AuthStatusBoundary>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />

          <Route element={<OnboardingGate />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/focus" element={<FocusSessionPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthStatusBoundary>
  )
}

export default App
