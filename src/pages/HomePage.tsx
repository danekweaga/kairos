import { useNavigate } from "react-router-dom"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"

export function HomePage() {
  const navigate = useNavigate()
  const { profile, user, signOut, sendPasswordReset, loading, error } = useAuth()
  const [resetMessage, setResetMessage] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)

  const displayDate = new Date("2026-03-22").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
          <CardDescription>{displayDate}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {profile?.main_goal
            ? `Main goal: ${profile.main_goal}`
            : "Set your main goal in preferences to personalize recommendations."}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ready to start?</CardTitle>
          <CardDescription>Jump into planning or start a focus block.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
            Start Focus Session
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/onboarding")}>
            Update Preferences
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/how-to-use")}>
            How to Use
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={async () => {
              await signOut()
              navigate("/", { replace: true })
            }}
          >
            Logout
          </Button>
          <Button
            type="button"
            variant="link"
            onClick={async () => {
              setResetMessage(null)
              setResetError(null)
              if (!user?.email) {
                setResetError("No email found for this account.")
                return
              }
              try {
                await sendPasswordReset(user.email)
                setResetMessage("Password reset link sent to your email.")
              } catch (err) {
                setResetError(err instanceof Error ? err.message : "Failed to send reset link.")
              }
            }}
            disabled={loading}
          >
            Forgot password
          </Button>
          {resetMessage ? <p className="w-full text-sm text-emerald-600">{resetMessage}</p> : null}
          {(resetError || error) ? (
            <p className="w-full text-sm text-destructive">{resetError ?? error}</p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Last Session Summary</CardTitle>
          <CardDescription>Optional insights for your next block.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No recent session summary yet. Complete a focus session to see insights here.
        </CardContent>
      </Card>
    </main>
  )
}
