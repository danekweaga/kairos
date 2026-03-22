import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function LandingPage() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl items-center p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Kairos</CardTitle>
          <CardDescription>
            A real-time decision system that helps you work on the right task, at the right time, and
            adapt when effort is no longer effective.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            Plan with ROI, match work to your energy, and stay effective with guided focus sessions.
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/signup">
              <Button type="button">Create Account</Button>
            </Link>
            <Link to="/login">
              <Button type="button" variant="outline">
                Log In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
