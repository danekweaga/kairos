import { BreakRecommendationModal } from "@/components/BreakRecommendationModal"
import { CheckpointModal } from "@/components/CheckpointModal"
import { MediaSelector } from "@/components/MediaSelector"
import { ProgressBar } from "@/components/ProgressBar"
import { SessionTimer } from "@/components/SessionTimer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { FeelingQuick, MediaSelection, Task, TimerDisplayMode } from "@/lib/kairos-types"

type FocusSessionScreenProps = {
  task: Task
  remainingSeconds: number
  progressPercent: number
  timerDisplayMode: TimerDisplayMode
  pauseAllowed: number
  pauseUsed: number
  pausedByUser: boolean
  checkInOpen: boolean
  breakOpen: boolean
  currentCheckpoint: number
  selectedFeeling: FeelingQuick | ""
  customFeeling: string
  expectsToFinishOnTime: boolean | null
  media: MediaSelection
  showCelebration: boolean
  onCheckInYes: () => void
  onCheckInNo: () => void
  onFeelingChange: (value: FeelingQuick) => void
  onCustomFeelingChange: (value: string) => void
  onExpectsToFinishChange: (value: boolean) => void
  onResumeFromBreak: () => void
  onSwitchTask: () => void
  onEndSession: () => void
  onStuck: () => void
  onDoneEarly: () => void
  onPauseToggle: () => void
  onMediaChange: (value: MediaSelection) => void
}

export function FocusSessionScreen({
  task,
  remainingSeconds,
  progressPercent,
  timerDisplayMode,
  pauseAllowed,
  pauseUsed,
  pausedByUser,
  checkInOpen,
  breakOpen,
  currentCheckpoint,
  selectedFeeling,
  customFeeling,
  expectsToFinishOnTime,
  media,
  showCelebration,
  onCheckInYes,
  onCheckInNo,
  onFeelingChange,
  onCustomFeelingChange,
  onExpectsToFinishChange,
  onResumeFromBreak,
  onSwitchTask,
  onEndSession,
  onStuck,
  onDoneEarly,
  onPauseToggle,
  onMediaChange,
}: FocusSessionScreenProps) {
  const remainingPauses = Math.max(0, pauseAllowed - pauseUsed)

  return (
    <main className="flex min-h-svh w-full flex-col gap-6 bg-muted/30 p-6">
      <Card className="sticky top-2 z-20 mx-auto w-full max-w-6xl border-primary/40 bg-background/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl">Focus Session</CardTitle>
          <CardDescription>You are working on: {task.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SessionTimer remainingSeconds={remainingSeconds} displayMode={timerDisplayMode} />
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Session progress</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <ProgressBar value={progressPercent} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onPauseToggle}
              disabled={!pausedByUser && remainingPauses <= 0}
            >
              {pausedByUser ? "Resume" : "Pause"}
            </Button>
            <p className="flex items-center text-sm text-muted-foreground">Pauses left: {remainingPauses}</p>
            <Button type="button" onClick={onDoneEarly}>
              Done
            </Button>
            <Button type="button" variant="outline" onClick={onStuck}>
              I'm Stuck
            </Button>
            <Button type="button" variant="outline" onClick={onEndSession}>
              End Session
            </Button>
          </div>
        </CardContent>
      </Card>

      {showCelebration ? (
        <Card className="mx-auto w-full max-w-6xl">
          <CardHeader>
            <CardTitle>Great Work 🎉</CardTitle>
            <CardDescription>You finished this task early. Momentum like this compounds.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
              Celebratory mode activated. Take a quick reset and choose the next high-impact move.
            </div>
            <Button type="button" onClick={onSwitchTask}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="mx-auto w-full max-w-6xl">
        <MediaSelector media={media} onChange={onMediaChange} />
      </div>

      <CheckpointModal
        open={checkInOpen}
        checkpoint={currentCheckpoint}
        onYes={onCheckInYes}
        onNo={onCheckInNo}
      />

      <BreakRecommendationModal
        open={breakOpen}
        stage={currentCheckpoint}
        totalMinutes={Math.max(1, Math.round(task.estimatedHours * 60))}
        selectedFeeling={selectedFeeling}
        customFeeling={customFeeling}
        expectsToFinishOnTime={expectsToFinishOnTime}
        onFeelingChange={onFeelingChange}
        onCustomFeelingChange={onCustomFeelingChange}
        onExpectsToFinishChange={onExpectsToFinishChange}
        onResume={onResumeFromBreak}
        onSwitchTask={onSwitchTask}
        onEndSession={onEndSession}
      />
    </main>
  )
}
