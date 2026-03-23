import { useNavigate } from "react-router-dom"

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

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>How to Use Kairos</CardTitle>
          <CardDescription>
            A quick step-by-step guide to plan better and run focused sessions without friction.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button type="button" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/home")}>
            Back to Home
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/onboarding")}>
            Update Preferences
          </Button>
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
