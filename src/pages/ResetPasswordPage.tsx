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
import { validatePasswordStrength } from "@/lib/validation"

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const { loading, signOut, updatePassword } = useAuth()
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
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search)
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""))
          const redirectError =
            params.get("error_description") ??
            params.get("error") ??
            params.get("message")

          if (redirectError) {
            // #region agent log
            fetch("http://127.0.0.1:7813/ingest/5b4830d4-73b3-470d-a8be-4731797e0582", {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f0655d" },
              body: JSON.stringify({
                sessionId: "f0655d",
                runId: "reset-diagnose",
                hypothesisId: "H2",
                location: "ResetPasswordPage.tsx:checkRecoverySession",
                message: "redirect_error_param_detected",
                data: {
                  hasRedirectError: true,
                  hasCodeParam: Boolean(params.get("code")),
                  searchLength: window.location.search.length,
                  hashLength: window.location.hash.length,
                },
                timestamp: Date.now(),
              }),
            }).catch(() => {})
            // #endregion

            setSessionReady(false)
            setSubmitError(decodeURIComponent(redirectError).replace(/\+/g, " "))
            return
          }

          const code = params.get("code")
          const hashType = hashParams.get("type")
          const hashAccessToken = hashParams.get("access_token")
          const hashRefreshToken = hashParams.get("refresh_token")

          // #region agent log
          fetch("http://127.0.0.1:7813/ingest/5b4830d4-73b3-470d-a8be-4731797e0582", {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f0655d" },
            body: JSON.stringify({
              sessionId: "f0655d",
              runId: "reset-diagnose",
              hypothesisId: "H2",
              location: "ResetPasswordPage.tsx:checkRecoverySession",
              message: "initial_url_state",
              data: {
                hasCodeParam: Boolean(code),
                hashType,
                hasHashAccessToken: Boolean(hashAccessToken),
                hasHashRefreshToken: Boolean(hashRefreshToken),
                searchLength: window.location.search.length,
                hashLength: window.location.hash.length,
              },
              timestamp: Date.now(),
            }),
          }).catch(() => {})
          // #endregion

          if (!code && hashType === "recovery" && hashAccessToken && hashRefreshToken) {
            const hashSessionStart = typeof performance !== "undefined" ? performance.now() : Date.now()
            const { error: hashSessionError } = await supabase.auth.setSession({
              access_token: hashAccessToken,
              refresh_token: hashRefreshToken,
            })
            const hashSessionMs =
              (typeof performance !== "undefined" ? performance.now() : Date.now()) - hashSessionStart

            // #region agent log
            fetch("http://127.0.0.1:7813/ingest/5b4830d4-73b3-470d-a8be-4731797e0582", {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f0655d" },
              body: JSON.stringify({
                sessionId: "f0655d",
                runId: "post-fix",
                hypothesisId: "H2",
                location: "ResetPasswordPage.tsx:checkRecoverySession",
                message: "hash_session_result",
                data: {
                  hasHashSessionError: Boolean(hashSessionError),
                  hashSessionMs: Math.round(hashSessionMs),
                },
                timestamp: Date.now(),
              }),
            }).catch(() => {})
            // #endregion

            if (hashSessionError) {
              setSessionReady(false)
              setSubmitError(hashSessionError.message)
              return
            }
          }

          if (code) {
            const exchangeStart = typeof performance !== "undefined" ? performance.now() : Date.now()
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
            const exchangeMs =
              (typeof performance !== "undefined" ? performance.now() : Date.now()) - exchangeStart

            // #region agent log
            fetch("http://127.0.0.1:7813/ingest/5b4830d4-73b3-470d-a8be-4731797e0582", {
              method: "POST",
              headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f0655d" },
              body: JSON.stringify({
                sessionId: "f0655d",
                runId: "reset-diagnose",
                hypothesisId: "H3",
                location: "ResetPasswordPage.tsx:checkRecoverySession",
                message: "exchange_code_result",
                data: {
                  hasExchangeError: Boolean(exchangeError),
                  exchangeMs: Math.round(exchangeMs),
                },
                timestamp: Date.now(),
              }),
            }).catch(() => {})
            // #endregion

            if (exchangeError) {
              setSessionReady(false)
              setSubmitError(exchangeError.message)
              return
            }
          }
        }

        const getSessionStart = typeof performance !== "undefined" ? performance.now() : Date.now()
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const getSessionMs = (typeof performance !== "undefined" ? performance.now() : Date.now()) - getSessionStart

        if (!isMounted) return
        setSessionReady(Boolean(session?.user))

        // #region agent log
        fetch("http://127.0.0.1:7813/ingest/5b4830d4-73b3-470d-a8be-4731797e0582", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f0655d" },
          body: JSON.stringify({
            sessionId: "f0655d",
            runId: "reset-diagnose",
            hypothesisId: "H2",
            location: "ResetPasswordPage.tsx:checkRecoverySession",
            message: "get_session_result",
            data: {
              hasSessionUser: Boolean(session?.user),
              getSessionMs: Math.round(getSessionMs),
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {})
        // #endregion

        if (!session?.user) {
          setSubmitError(
            "Recovery link is missing or expired. Request a new reset email and verify your Supabase redirect URL points to /reset-password."
          )
        }
      } catch {
        // #region agent log
        fetch("http://127.0.0.1:7813/ingest/5b4830d4-73b3-470d-a8be-4731797e0582", {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f0655d" },
          body: JSON.stringify({
            sessionId: "f0655d",
            runId: "reset-diagnose",
            hypothesisId: "H3",
            location: "ResetPasswordPage.tsx:checkRecoverySession",
            message: "get_session_exception",
            data: {},
            timestamp: Date.now(),
          }),
        }).catch(() => {})
        // #endregion

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted) return
      // #region agent log
      fetch("http://127.0.0.1:7813/ingest/5b4830d4-73b3-470d-a8be-4731797e0582", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f0655d" },
        body: JSON.stringify({
          sessionId: "f0655d",
          runId: "reset-diagnose",
          hypothesisId: "H2",
          location: "ResetPasswordPage.tsx:onAuthStateChange",
          message: "auth_state_change_event",
          data: { event, hasUser: Boolean(nextSession?.user) },
          timestamp: Date.now(),
        }),
      }).catch(() => {})
      // #endregion
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setSessionReady(Boolean(nextSession?.user))
        if (nextSession?.user) {
          setSubmitError(null)
        }
        setCheckingSession(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(null)
    setSuccessMessage(null)

    // #region agent log
    fetch("http://127.0.0.1:7813/ingest/5b4830d4-73b3-470d-a8be-4731797e0582", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "f0655d" },
      body: JSON.stringify({
        sessionId: "f0655d",
        runId: "reset-diagnose",
        hypothesisId: "H4",
        location: "ResetPasswordPage.tsx:handleSubmit",
        message: "submit_attempt",
        data: {
          sessionReady,
          newPasswordLen: newPassword.length,
          confirmMatches: newPassword === confirmPassword,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion

    if (!sessionReady) {
      setSubmitError("No valid recovery session found. Request a new reset link.")
      return
    }

    const passwordError = validatePasswordStrength(newPassword)
    if (passwordError) {
      setSubmitError(passwordError)
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
      window.setTimeout(() => navigate("/login", { replace: true }), 1200)
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
              minLength={8}
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
              minLength={8}
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

        {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
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
