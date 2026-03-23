import { BreakRecommendationModal } from "@/components/BreakRecommendationModal"
import { CheckpointModal } from "@/components/CheckpointModal"
import { MediaSelector } from "@/components/MediaSelector"
import { ProgressBar } from "@/components/ProgressBar"
import { SessionTimer } from "@/components/SessionTimer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type {
  FeelingQuick,
  FocusViewMode,
  MediaSelection,
  Task,
  TimerDisplayMode,
} from "@/lib/kairos-types"

type FocusSessionScreenProps = {
  task: Task
  remainingSeconds: number
  progressPercent: number
  timerDisplayMode: TimerDisplayMode
  viewMode: FocusViewMode
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
  onCloseBreakPanel: () => void
  onResumeFromBreak: () => void
  onSwitchTask: () => void
  onEndSession: () => void
  onStuck: () => void
  onDoneEarly: () => void
  onPauseToggle: () => void
  onMediaChange: (value: MediaSelection) => void
  onEnterFullscreenClock: () => void
  onEnterMiniClock: () => void
  onExitSpecialView: () => void
}

export function FocusSessionScreen({
  task,
  remainingSeconds,
  progressPercent,
  timerDisplayMode,
  viewMode,
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
  onCloseBreakPanel,
  onResumeFromBreak,
  onSwitchTask,
  onEndSession,
  onStuck,
  onDoneEarly,
  onPauseToggle,
  onMediaChange,
  onEnterFullscreenClock,
  onEnterMiniClock,
  onExitSpecialView,
}: FocusSessionScreenProps) {
  const remainingPauses = Math.max(0, pauseAllowed - pauseUsed)
  const timerMode = viewMode === "mini" ? "compact" : timerDisplayMode

  const overlays = (
    <>
      <CheckpointModal
        open={checkInOpen}
        checkpoint={currentCheckpoint}
        onYes={onCheckInYes}
        onNo={onCheckInNo}
      />

      <BreakRecommendationModal
        open={breakOpen}
        onClose={onCloseBreakPanel}
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
    </>
  )

  if (viewMode === "fullscreen") {
    return (
      <main className="relative flex min-h-svh w-full flex-col bg-black p-6 text-white">
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onEnterMiniClock}>
            Mini Corner
          </Button>
          <Button type="button" variant="outline" onClick={onExitSpecialView}>
            Exit Fullscreen
          </Button>
        </div>

        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-6">
          <p className="text-center text-sm text-white/80">Working on: {task.name}</p>
          <SessionTimer remainingSeconds={remainingSeconds} displayMode="large" />
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={onPauseToggle}
              disabled={!pausedByUser && remainingPauses <= 0}
            >
              {pausedByUser ? "Resume" : "Pause"}
            </Button>
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
        </div>

        {overlays}
      </main>
    )
  }

  if (viewMode === "mini") {
    return (
      <main className="relative min-h-svh w-full bg-black p-6 text-white">
        <div className="fixed right-4 bottom-4 z-20 w-[min(90vw,420px)] rounded-2xl border border-white/20 bg-background/95 p-4 text-foreground shadow-xl backdrop-blur-sm">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Mini Clock</p>
          <p className="mb-3 truncate text-sm text-muted-foreground">Task: {task.name}</p>
          <SessionTimer remainingSeconds={remainingSeconds} displayMode="compact" />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onPauseToggle}
              disabled={!pausedByUser && remainingPauses <= 0}
            >
              {pausedByUser ? "Resume" : "Pause"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={onEnterFullscreenClock}>
              Fullscreen
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={onExitSpecialView}>
              Expand App
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={onEndSession}>
              End Session
            </Button>
          </div>
        </div>

        {overlays}
      </main>
    )
  }

  return (
    <main className="flex min-h-svh w-full flex-col gap-6 bg-muted/30 p-6">
      <Card className="sticky top-2 z-20 mx-auto w-full max-w-6xl border-primary/40 bg-background/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl">Focus Session</CardTitle>
          <CardDescription>You are working on: {task.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <SessionTimer remainingSeconds={remainingSeconds} displayMode={timerMode} />
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
            <Button type="button" variant="outline" onClick={onEnterFullscreenClock}>
              Fullscreen Clock
            </Button>
            <Button type="button" variant="outline" onClick={onEnterMiniClock}>
              Mini Corner
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

      {overlays}
    </main>
  )
}
