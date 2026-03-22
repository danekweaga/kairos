import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"

import { AuthShell } from "@/components/AuthShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext"

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, sendPasswordReset, loading, error } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showResetForm, setShowResetForm] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(null)

    try {
      await signIn(email, password)
      navigate("/home", { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unable to log in.")
    }
  }

  async function handlePasswordReset() {
    setSubmitError(null)
    setResetMessage(null)
    try {
      await sendPasswordReset(resetEmail || email)
      setResetMessage("Password reset link sent. Check your inbox.")
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to send reset email.")
    }
  }

  return (
    <AuthShell
      title="Kairos"
      subtitle="Enter your temporal sanctuary."
    >
      <form className="w-full max-w-md space-y-8" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="email" className="ml-1 block text-xs font-semibold tracking-[0.16em] text-[#586064] uppercase">
            Email Address
          </Label>
          <div className="relative group">
            <Mail className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-4 size-5 text-[#737c7f]" />
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@domain.com"
              className="h-14 rounded-xl border-0 bg-[#f1f4f6] py-4 pr-4 pl-11 text-[#2b3437] placeholder:text-[#737c7f]/50 transition-all duration-300 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#d2d0ff]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="ml-1 flex items-end justify-between">
            <Label htmlFor="password" className="block text-xs font-semibold tracking-[0.16em] text-[#586064] uppercase">
              Password
            </Label>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs font-medium text-[#4f4ccd] hover:text-[#423fc0]"
              onClick={() => setShowResetForm((current) => !current)}
            >
              Forgot password?
            </Button>
          </div>
          <div className="relative group">
            <Lock className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-4 size-5 text-[#737c7f]" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              className="h-14 rounded-xl border-0 bg-[#f1f4f6] py-4 pr-12 pl-11 text-[#2b3437] placeholder:text-[#737c7f]/50 transition-all duration-300 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-[#d2d0ff]"
            />
            <Button
              type="button"
              variant="ghost"
              className="absolute inset-y-0 right-0 my-auto mr-3 h-8 w-8 rounded-full p-0 text-[#737c7f] hover:text-[#2b3437]"
              onClick={() => setShowPassword((current) => !current)}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          </div>
        </div>

        {(submitError || error) ? <p className="text-sm text-destructive">{submitError ?? error}</p> : null}

        <div className="space-y-6 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="h-14 w-full rounded-2xl bg-gradient-to-br from-[#4f4ccd] to-[#423fc0] text-[#faf6ff] shadow-lg shadow-[#4f4ccd]/20 transition-all duration-200 hover:shadow-[#4f4ccd]/30 active:scale-[0.98] [font-family:Manrope,Inter,sans-serif]"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          {showResetForm ? (
            <div className="space-y-3 rounded-xl border border-[#dbe4e7] bg-[#f8f9fa] p-4">
              <Label htmlFor="reset-email" className="text-xs text-[#586064]">
                Reset email
              </Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(event) => setResetEmail(event.target.value)}
                placeholder={email || "you@example.com"}
                className="h-11 rounded-xl border border-[#dbe4e7] bg-white"
              />
              <Button type="button" variant="outline" onClick={handlePasswordReset} disabled={loading}>
                Send reset link
              </Button>
              {resetMessage ? <p className="text-sm text-emerald-600">{resetMessage}</p> : null}
            </div>
          ) : null}

          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm text-[#586064]">New to Kairos?</span>
            <Link to="/signup" className="text-sm font-semibold text-[#4f4ccd] underline-offset-4 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </form>
    </AuthShell>
  )
}
