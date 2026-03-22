import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { EnergyLevel, Task } from "@/lib/kairos-types"
import { calculateRoi, energyToTaskType } from "@/lib/session-helpers"

type RecommendationCardProps = {
  energyLevel: EnergyLevel
  recommendedTask?: Task
  onStartSession: () => void
}

export function RecommendationCard({
  energyLevel,
  recommendedTask,
  onStartSession,
}: RecommendationCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendation</CardTitle>
        <CardDescription>Best task for your current mental energy.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border p-3 text-sm">
          <p className="mb-1 text-muted-foreground">
            Current energy maps to{" "}
            <span className="font-medium text-foreground">{energyToTaskType[energyLevel]}</span> tasks.
          </p>
          {recommendedTask ? (
            <p>
              Best task right now: <span className="font-medium">{recommendedTask.name}</span> (ROI{" "}
              {calculateRoi(recommendedTask).toFixed(2)})
            </p>
          ) : (
            <p className="text-muted-foreground">
              No tasks match this energy. Add a task or switch energy level.
            </p>
          )}
        </div>
        <Button type="button" onClick={onStartSession} disabled={!recommendedTask}>
          Start Session
        </Button>
      </CardContent>
    </Card>
  )
}
