import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"

import { AuthShell } from "@/components/AuthShell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext"

export function SignupPage() {
  const navigate = useNavigate()
  const { signUp, loading, error } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError(null)

    try {
      await signUp(email, password)
      navigate("/onboarding", { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Unable to create account.")
    }
  }

  return (
    <AuthShell
      title="Kairos"
      subtitle="Create your temporal sanctuary."
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
          <Label htmlFor="password" className="ml-1 block text-xs font-semibold tracking-[0.16em] text-[#586064] uppercase">
            Password
          </Label>
          <div className="relative group">
            <Lock className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-4 size-5 text-[#737c7f]" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              minLength={6}
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
            {loading ? "Creating account..." : "Create account"}
          </Button>

          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm text-[#586064]">Already have an account?</span>
            <Link to="/login" className="text-sm font-semibold text-[#4f4ccd] underline-offset-4 hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </form>
    </AuthShell>
  )
}
