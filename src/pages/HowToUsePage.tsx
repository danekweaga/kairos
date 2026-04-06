import { useNavigate, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const guideSteps = [
  {
    title: "1) Set up your profile",
    description:
      "Open onboarding/preferences to set your main goal and session preferences so recommendations feel relevant.",
  },
  {
    title: "2) Build your task list on Dashboard",
    description:
      "Add tasks with name, weight, estimated hours, and type. Kairos uses ROI (weight / estimatedHours) to rank impact.",
  },
  {
    title: "3) Pick your current energy level",
    description:
      "Choose low, medium, or high energy. Kairos combines ROI + energy to suggest the best task for this block.",
  },
  {
    title: "4) Start Focus Session",
    description:
      "Use Start Session from the recommendation card. Timer, progress, and checkpoints begin automatically.",
  },
  {
    title: "5) Use checkpoints, pause, and break tools",
    description:
      "At checkpoints, confirm progress. If stuck, open the break panel, choose a feeling, then use Resume Task, Switch Task, End Session, or the close button to exit.",
  },
  {
    title: "6) Use clock display modes when needed",
    description:
      "Use Fullscreen Clock for an immersive black screen, then Exit Fullscreen when done. Use Mini Corner for a compact floating timer and Expand App to return to the full layout.",
  },
  {
    title: "7) End and continue",
    description:
      "When finished, mark Done for celebration flow or End Session to return to dashboard and start your next highest-impact task.",
  },
]

export function HowToUsePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isIntro = searchParams.get("intro") === "1"

  function exitIntro(path: string) {
    navigate(path, { replace: true })
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 p-6">
      {isIntro ? (
        <section className="rounded-2xl border border-[#e8ecf0] bg-gradient-to-br from-[#f6f4ff] via-[#faf8ff] to-[#f1f4f6] px-6 py-10 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6b7280]">Welcome</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#2b3437] [font-family:Manrope,Inter,sans-serif]">
            You&apos;re in. Here&apos;s how Kairos works.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#586064]">
            Take a minute to skim the guide below, then we&apos;ll walk you through a short setup so your sessions and
            recommendations match how you work.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              className="rounded-xl bg-gradient-to-br from-[#4f4ccd] to-[#423fc0] text-[#faf6ff]"
              onClick={() => exitIntro("/onboarding")}
            >
              Continue to setup
            </Button>
            <Button type="button" variant="outline" className="rounded-xl" onClick={() => exitIntro("/onboarding")}>
              Skip intro
            </Button>
          </div>
        </section>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{isIntro ? "Quick intro" : "How to Use Kairos"}</CardTitle>
          <CardDescription>
            {isIntro
              ? "The essentials in a few steps—then you can explore the dashboard anytime from Home."
              : "A quick step-by-step guide to plan better and run focused sessions without friction."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {isIntro ? (
            <>
              <Button type="button" onClick={() => navigate("/onboarding")}>
                Continue to setup
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
            </>
          ) : (
            <>
              <Button type="button" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/home")}>
                Back to Home
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/onboarding")}>
                Update Preferences
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {guideSteps.map((step) => (
        <Card key={step.title}>
          <CardHeader>
            <CardTitle className="text-lg">{step.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">
            {step.description}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Pro tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>- Keep tasks small enough that estimated hours are realistic.</p>
          <p>- If you need deep focus, switch to Fullscreen Clock before starting.</p>
          <p>- If you need to monitor time while multitasking, use Mini Corner mode.</p>
        </CardContent>
      </Card>
    </main>
  )
}
