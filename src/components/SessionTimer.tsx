import { formatDuration } from "@/lib/session-helpers"
import type { TimerDisplayMode } from "@/lib/kairos-types"

type SessionTimerProps = {
  remainingSeconds: number
  displayMode: TimerDisplayMode
}

export function SessionTimer({ remainingSeconds, displayMode }: SessionTimerProps) {
  const timerClass =
    displayMode === "large"
      ? "font-heading text-6xl font-semibold sm:text-7xl"
      : "font-heading text-4xl font-semibold sm:text-5xl"

  return (
    <div className="rounded-2xl border bg-card px-8 py-10 text-center">
      <p className="mb-3 text-sm uppercase tracking-wider text-muted-foreground">Focus Countdown</p>
      <p className={timerClass}>{formatDuration(remainingSeconds)}</p>
    </div>
  )
}
