import type { ReactNode } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"

export function AuthStatusBoundary({ children }: { children: ReactNode }) {
  const { loading, initError } = useAuth()

  if (loading) {
    return (
      <main className="mx-auto flex min-h-svh w-full max-w-2xl items-center p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Loading Kairos</CardTitle>
            <CardDescription>Checking your session...</CardDescription>
          </CardHeader>
        </Card>
      </main>
    )
  }

  if (initError) {
    return (
      <main className="mx-auto flex min-h-svh w-full max-w-2xl items-center p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Auth Error</CardTitle>
            <CardDescription>{initError}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Refresh the page or try signing in again.
          </CardContent>
        </Card>
      </main>
    )
  }

  return <>{children}</>
}
