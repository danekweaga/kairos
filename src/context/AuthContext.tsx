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

type AuthContextValue = {
  session: Session | null
  user: User | null
  profile: Profile | null
  loading: boolean
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
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
        setError(err instanceof Error ? err.message : "Failed to initialize auth.")
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
      setError(null)

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
    setLoading(true)
    setError(null)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (signInError) {
      setError(signInError.message)
      throw signInError
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError) {
      setLoading(false)
      setError(signUpError.message)
      throw signUpError
    }

    if (data.user) {
      await loadProfile(data.user.id)
    }

    setLoading(false)
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
    setLoading(true)
    setError(null)

    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173"
    const redirectTo = `${origin}/reset-password`
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      throw resetError
    }
  }, [])

  const updatePassword = useCallback(async (newPassword: string) => {
    setLoading(true)
    setError(null)

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      throw updateError
    }
  }, [])

  const saveOnboarding = useCallback(async (values: OnboardingFormValues) => {
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      const updated = await updateProfile(user.id, {
        ...values,
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
