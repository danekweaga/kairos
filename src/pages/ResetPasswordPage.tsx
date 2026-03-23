import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Lock } from "lucide-react"

import { AuthShell } from "@/components/AuthShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext"
import { supabase } from "@/lib/supabase"

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { loading, error, signOut, updatePassword } = useAuth()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [checkingSession, setCheckingSession] = useState(true)
  const [sessionReady, setSessionReady] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function checkRecoverySession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!isMounted) return
        setSessionReady(Boolean(session?.user))
        if (!session?.user) {
          setSubmitError(
            "Recovery link is missing or expired. Request a new reset email and verify your Supabase redirect URL points to /reset-password."
          )
        }
      } catch {
        if (!isMounted) return
        setSessionReady(false)
        setSubmitError("Could not verify your recovery session. Please request a new reset link.")
      } finally {
        if (isMounted) {
          setCheckingSession(false)
        }
      }
    }

    checkRecoverySession()

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(null)
    setSuccessMessage(null)

    if (!sessionReady) {
      setSubmitError("No valid recovery session found. Request a new reset link.")
      return
    }

    if (newPassword.length < 6) {
      setSubmitError("Password must be at least 6 characters.")
      return
    }

    if (newPassword !== confirmPassword) {
      setSubmitError("Passwords do not match.")
      return
    }

    try {
      await updatePassword(newPassword)
      setSuccessMessage("Password updated successfully. You can now log in.")
      await signOut()
      setTimeout(() => navigate("/login", { replace: true }), 1200)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to update password.")
    }
  }

  return (
    <AuthShell
      title="Kairos"
      subtitle="Reset your password to re-enter your sanctuary."
    >
      <form className="w-full max-w-md space-y-8" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="new-password" className="ml-1 block text-xs font-semibold tracking-[0.16em] text-[#586064] uppercase">
            New Password
          </Label>
          <div className="relative group">
            <Lock className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-4 size-5 text-[#737c7f]" />
            <Input
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              required
              minLength={6}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              className="h-14 rounded-xl border-0 bg-[#f1f4f6] py-4 pr-12 pl-11 text-[#2b3437] placeholder:text-[#737c7f]/50 transition-all duration-300 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#d2d0ff]"
            />
            <Button
              type="button"
              variant="ghost"
              className="absolute inset-y-0 right-0 my-auto mr-3 h-8 w-8 rounded-full p-0 text-[#737c7f] hover:text-[#2b3437]"
              onClick={() => setShowNewPassword((current) => !current)}
            >
              {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password" className="ml-1 block text-xs font-semibold tracking-[0.16em] text-[#586064] uppercase">
            Confirm Password
          </Label>
          <div className="relative group">
            <Lock className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-4 size-5 text-[#737c7f]" />
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              required
              minLength={6}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="h-14 rounded-xl border-0 bg-[#f1f4f6] py-4 pr-12 pl-11 text-[#2b3437] placeholder:text-[#737c7f]/50 transition-all duration-300 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#d2d0ff]"
            />
            <Button
              type="button"
              variant="ghost"
              className="absolute inset-y-0 right-0 my-auto mr-3 h-8 w-8 rounded-full p-0 text-[#737c7f] hover:text-[#2b3437]"
              onClick={() => setShowConfirmPassword((current) => !current)}
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </div>
        </div>

        {(submitError || error) ? <p className="text-sm text-destructive">{submitError ?? error}</p> : null}
        {successMessage ? <p className="text-sm text-emerald-600">{successMessage}</p> : null}
        {checkingSession ? (
          <p className="text-sm text-muted-foreground">Verifying reset link...</p>
        ) : null}

        <div className="space-y-6 pt-4">
          <Button
            type="submit"
            disabled={loading || checkingSession || !sessionReady}
            className="h-14 w-full rounded-2xl bg-gradient-to-br from-[#4f4ccd] to-[#423fc0] text-[#faf6ff] shadow-lg shadow-[#4f4ccd]/20 transition-all duration-200 hover:shadow-[#4f4ccd]/30 active:scale-[0.98] [font-family:Manrope,Inter,sans-serif]"
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>

          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm text-[#586064]">Remembered your password?</span>
            <Link to="/login" className="text-sm font-semibold text-[#4f4ccd] underline-offset-4 hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </form>
    </AuthShell>
  )
}
