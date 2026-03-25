import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { Session, User } from "@supabase/supabase-js"

import type { OnboardingFormValues, Profile } from "@/lib/kairos-types"
import { createProfile, getProfile, updateProfile } from "@/lib/profile"
import { supabase } from "@/lib/supabase"
import { clampNumber, isValidEmail, normalizeEmail, sanitizeText } from "@/lib/validation"

type AuthContextValue = {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
  initError: string | null
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  refreshProfile: () => Promise<void>
  saveOnboarding: (values: OnboardingFormValues) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const DEFAULT_APP_ORIGIN = "http://localhost:5173"

function getAppOrigin(): string {
  const configuredOrigin = import.meta.env.VITE_APP_ORIGIN as string | undefined
  if (configuredOrigin && configuredOrigin.trim()) {
    return configuredOrigin.replace(/\/+$/, "")
  }
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  return DEFAULT_APP_ORIGIN
}

function logAuthEvent(event: string, metadata?: Record<string, string | number | boolean>) {
  // Non-sensitive auth telemetry for debugging and security checks.
  console.info(`[auth] ${event}`, metadata ?? {})
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadProfile = useCallback(async (userId: string) => {
    let nextProfile = await getProfile(userId)
    if (!nextProfile) {
      nextProfile = await createProfile(userId)
    }
    setProfile(nextProfile)
    return nextProfile
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!user) return
    setError(null)
    try {
      await loadProfile(user.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh profile.")
    }
  }, [loadProfile, user])

  useEffect(() => {
    let isMounted = true

    async function initAuth() {
      setLoading(true)
      setInitError(null)
      setError(null)
      try {
        const {
          data: { session: existingSession },
        } = await supabase.auth.getSession()

        if (!isMounted) return
        setSession(existingSession)
        setUser(existingSession?.user ?? null)

        if (existingSession?.user) {
          try {
            await loadProfile(existingSession.user.id)
          } catch {
            // Do not block auth flows (including password recovery) on profile errors.
            setProfile(null)
          }
        } else {
          setProfile(null)
        }
      } catch (err) {
        if (!isMounted) return
        setInitError(err instanceof Error ? err.message : "Failed to initialize auth.")
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setInitError(null)

      if (nextSession?.user) {
        try {
          await loadProfile(nextSession.user.id)
        } catch {
          // Keep auth session usable even when profile lookup fails.
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    const normalizedEmail = normalizeEmail(email)
    if (!isValidEmail(normalizedEmail)) {
      throw new Error("Please enter a valid email address.")
    }

    setLoading(true)
    setError(null)
    logAuthEvent("login_attempt", { emailDomain: normalizedEmail.split("@")[1] ?? "unknown" })
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })
    setLoading(false)
    if (signInError) {
      logAuthEvent("login_failure", { reason: "supabase_error" })
      setError(signInError.message)
      throw signInError
    }
    logAuthEvent("login_success")
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const normalizedEmail = normalizeEmail(email)
    if (!isValidEmail(normalizedEmail)) {
      throw new Error("Please enter a valid email address.")
    }

    setLoading(true)
    setError(null)
    logAuthEvent("signup_attempt", { emailDomain: normalizedEmail.split("@")[1] ?? "unknown" })
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
    })

    if (signUpError) {
      logAuthEvent("signup_failure", { reason: "supabase_error" })
      setLoading(false)
      setError(signUpError.message)
      throw signUpError
    }

    if (data.user) {
      await loadProfile(data.user.id)
    }

    setLoading(false)
    logAuthEvent("signup_success")
  }, [loadProfile])

  const signOut = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { error: signOutError } = await supabase.auth.signOut()
    setLoading(false)
    if (signOutError) {
      setError(signOutError.message)
      throw signOutError
    }
  }, [])

  const sendPasswordReset = useCallback(async (email: string) => {
    const normalizedEmail = normalizeEmail(email)
    if (!isValidEmail(normalizedEmail)) {
      throw new Error("Please enter a valid email address.")
    }

    setLoading(true)
    setError(null)

    const redirectTo = `${getAppOrigin()}/reset-password`
    logAuthEvent("password_reset_attempt", { redirectTo })
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, { redirectTo })
    setLoading(false)

    if (resetError) {
      logAuthEvent("password_reset_failure", { reason: "supabase_error" })
      setError(resetError.message)
      throw resetError
    }
    logAuthEvent("password_reset_email_sent")
  }, [])

  const updatePassword = useCallback(async (newPassword: string) => {
    setLoading(true)
    setError(null)

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)

    if (updateError) {
      logAuthEvent("password_update_failure", { reason: "supabase_error" })
      setError(updateError.message)
      throw updateError
    }
    logAuthEvent("password_update_success")
  }, [])

  const saveOnboarding = useCallback(async (values: OnboardingFormValues) => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      const sanitizedValues: Partial<OnboardingFormValues> = {
        role: sanitizeText(values.role ?? "", 60),
        preferred_language: sanitizeText(values.preferred_language ?? "", 40),
        main_goal: sanitizeText(values.main_goal ?? "", 500),
        preferred_session_length: clampNumber(Number(values.preferred_session_length), 15, 240, 25),
        audio_preference: sanitizeText(values.audio_preference ?? "", 60),
        guidance_style: sanitizeText(values.guidance_style ?? "", 40),
      }
      const updated = await updateProfile(user.id, {
        ...sanitizedValues,
        onboarding_completed: true,
      })
      setProfile(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save onboarding.")
      throw err
    } finally {
      setLoading(false)
    }
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user,
      profile,
      loading,
      initError,
      error,
      signIn,
      signUp,
      signOut,
      sendPasswordReset,
      updatePassword,
      refreshProfile,
      saveOnboarding,
    }),
    [
      error,
      initError,
      loading,
      profile,
      refreshProfile,
      saveOnboarding,
      sendPasswordReset,
      session,
      signIn,
      signOut,
      signUp,
      updatePassword,
      user,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.")
  }
  return context
}
