import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { CustomizationMenu } from "@/components/CustomizationMenu"
import { FocusSessionScreen } from "@/components/FocusSessionScreen"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type {
  FeelingQuick,
  FocusViewMode,
  MediaSelection,
  Task,
  TimerDisplayMode,
} from "@/lib/kairos-types"
import { extendSessionByQuarter, getCheckpointStage, getPauseAllowance } from "@/lib/session-helpers"
import { readJSON, removeStoredValue, STORAGE_KEYS, type PersistedActiveSession, writeJSON } from "@/lib/storage"

type FocusRouteState = {
  task?: Task
  media?: MediaSelection
  timerDisplayMode?: TimerDisplayMode
  darkMode?: boolean
}

export function FocusSessionPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state as FocusRouteState | null) ?? null
  const [storedSession] = useState<PersistedActiveSession | null>(() =>
    readJSON<PersistedActiveSession | null>(STORAGE_KEYS.activeSession, null)
  )
  const routeTask = state?.task
  const task = routeTask ?? storedSession?.task ?? null

  const [mediaSelection, setMediaSelection] = useState<MediaSelection>(
    state?.media ?? storedSession?.mediaSelection ?? { source: "none", url: "", title: "" }
  )
  const [timerDisplayMode, setTimerDisplayMode] = useState<TimerDisplayMode>(
    state?.timerDisplayMode ?? storedSession?.timerDisplayMode ?? "large"
  )
  const [darkMode, setDarkMode] = useState(state?.darkMode ?? storedSession?.darkMode ?? false)
  const [focusViewMode, setFocusViewMode] = useState<FocusViewMode>("default")

  const baseSeconds = useMemo(
    () => (task ? Math.max(300, Math.round(task.estimatedHours * 3600)) : 0),
    [task]
  )

  const [sessionTotalSeconds, setSessionTotalSeconds] = useState(
    routeTask ? baseSeconds : storedSession?.sessionTotalSeconds ?? baseSeconds
  )
  const [remainingSeconds, setRemainingSeconds] = useState(
    routeTask ? baseSeconds : storedSession?.remainingSeconds ?? baseSeconds
  )
  const [isRunning, setIsRunning] = useState(routeTask ? true : storedSession?.isRunning ?? false)
  const [currentCheckpoint, setCurrentCheckpoint] = useState(
    routeTask ? 25 : storedSession?.currentCheckpoint ?? 25
  )
  const [checkpointHistory, setCheckpointHistory] = useState<number[]>(
    routeTask ? [] : storedSession?.checkpointHistory ?? []
  )
  const [breakCount, setBreakCount] = useState(routeTask ? 0 : storedSession?.breakCount ?? 0)
  const [pauseUsed, setPauseUsed] = useState(routeTask ? 0 : storedSession?.pauseUsed ?? 0)
  const [pausedByUser, setPausedByUser] = useState(routeTask ? false : storedSession?.pausedByUser ?? false)
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [breakOpen, setBreakOpen] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [selectedFeeling, setSelectedFeeling] = useState<FeelingQuick | "">("")
  const [customFeeling, setCustomFeeling] = useState("")
  const [expectsToFinishOnTime, setExpectsToFinishOnTime] = useState<boolean | null>(null)

  const elapsedSeconds = Math.max(0, sessionTotalSeconds - remainingSeconds)
  const progressPercent =
    sessionTotalSeconds > 0 ? Math.min(100, (elapsedSeconds / sessionTotalSeconds) * 100) : 0
  const completedMinutes = Math.max(1, Math.round(elapsedSeconds / 60))
  const taskMinutes = task ? Math.max(1, Math.round(task.estimatedHours * 60)) : 0
  const pauseAllowed = getPauseAllowance(taskMinutes, breakCount)
  const breakRuleSummary =
    "You get 1 pause per 30 minutes, minimum 1. Every 2 breaks adds 1 extra pause."

  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.classList.toggle("dark", darkMode)
  }, [darkMode])

  function resetInterventionState() {
    setSelectedFeeling("")
    setCustomFeeling("")
    setExpectsToFinishOnTime(null)
  }

  function goToDashboard() {
    if (typeof document !== "undefined" && document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined)
    }
    removeStoredValue(STORAGE_KEYS.activeSession)
    navigate("/dashboard", { replace: true })
  }

  function handleDoneEarly() {
    setIsRunning(false)
    setShowCelebration(true)
  }

  async function handleEnterFullscreenClock() {
    setFocusViewMode("fullscreen")
    if (typeof document === "undefined") return
    if (document.fullscreenElement) return
    try {
      await document.documentElement.requestFullscreen()
    } catch {
      // Some browsers can reject fullscreen requests depending on user gesture context.
    }
  }

  function handleEnterMiniClock() {
    setFocusViewMode("mini")
    if (typeof document === "undefined") return
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined)
    }
  }

  async function handleExitSpecialView() {
    if (typeof document === "undefined") {
      setFocusViewMode("default")
      return
    }
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen()
      } catch {
        // Best effort only.
      }
    }
    setFocusViewMode("default")
  }

  function handleStuck() {
    setIsRunning(false)
    setPausedByUser(false)
    setCheckInOpen(false)
    setCurrentCheckpoint(getCheckpointStage(progressPercent) ?? 25)
    setBreakCount((current) => current + 1)
    setBreakOpen(true)
  }

  function handleCheckpointYes() {
    setCheckInOpen(false)
    if (currentCheckpoint >= 100) {
      setShowCelebration(true)
      setIsRunning(false)
      return
    }
    setPausedByUser(false)
    setIsRunning(true)
  }

  function handleCheckpointNo() {
    setCheckInOpen(false)
    setBreakCount((current) => current + 1)
    setBreakOpen(true)
  }

  function handleResumeFromBreak() {
    if (expectsToFinishOnTime === false) {
      const nextTotal = extendSessionByQuarter(sessionTotalSeconds)
      const addedSeconds = nextTotal - sessionTotalSeconds
      setSessionTotalSeconds(nextTotal)
      setRemainingSeconds((current) => current + addedSeconds)
    }

    setBreakOpen(false)
    resetInterventionState()
    if (remainingSeconds <= 0) {
      setShowCelebration(true)
      setIsRunning(false)
    } else {
      setPausedByUser(false)
      setIsRunning(true)
    }
  }

  function handleCloseBreakPanel() {
    handleResumeFromBreak()
  }

  function handleStartAnotherSession() {
    removeStoredValue(STORAGE_KEYS.activeSession)
    navigate("/dashboard")
  }

  function handlePauseToggle() {
    if (pausedByUser) {
      setPausedByUser(false)
      setIsRunning(true)
      return
    }
    if (pauseUsed >= pauseAllowed || !isRunning) return
    setPauseUsed((current) => current + 1)
    setPausedByUser(true)
    setIsRunning(false)
  }

  useEffect(() => {
    if (typeof window === "undefined") return
    if (!isRunning || checkInOpen || breakOpen || showCelebration) return

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [breakOpen, checkInOpen, isRunning, showCelebration])

  useEffect(() => {
    if (typeof window === "undefined") return
    if (checkInOpen || breakOpen || showCelebration) return
    const thresholds = [25, 50, 75, 100]
    const nextCheckpoint = thresholds.find(
      (threshold) => progressPercent >= threshold && !checkpointHistory.includes(threshold)
    )
    if (!nextCheckpoint) return

    const checkpointTimer = window.setTimeout(() => {
      setCheckpointHistory((current) => [...current, nextCheckpoint])
      setCurrentCheckpoint(nextCheckpoint)
      setIsRunning(false)
      setCheckInOpen(true)
    }, 0)

    return () => window.clearTimeout(checkpointTimer)
  }, [breakOpen, checkInOpen, checkpointHistory, progressPercent, showCelebration])

  useEffect(() => {
    if (typeof document === "undefined") return
    function handleFullscreenChange() {
      if (!document.fullscreenElement && focusViewMode === "fullscreen") {
        setFocusViewMode("default")
      }
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [focusViewMode])

  useEffect(() => {
    if (!task || showCelebration) {
      removeStoredValue(STORAGE_KEYS.activeSession)
      return
    }

    writeJSON<PersistedActiveSession>(STORAGE_KEYS.activeSession, {
      task,
      mediaSelection,
      timerDisplayMode,
      darkMode,
      sessionTotalSeconds,
      remainingSeconds,
      isRunning,
      currentCheckpoint,
      checkpointHistory,
      breakCount,
      pauseUsed,
      pausedByUser,
    })
  }, [
    breakCount,
    checkpointHistory,
    currentCheckpoint,
    darkMode,
    isRunning,
    mediaSelection,
    pauseUsed,
    pausedByUser,
    remainingSeconds,
    sessionTotalSeconds,
    showCelebration,
    task,
    timerDisplayMode,
  ])

  if (!task) {
    return (
      <main className="mx-auto flex min-h-svh w-full max-w-3xl items-center p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>No active session found</CardTitle>
            <CardDescription>
              Your previous focus state is unavailable. Start from your dashboard to begin a new block.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={goToDashboard}>
              Return to Dashboard
            </Button>
            <Button type="button" onClick={handleStartAnotherSession}>
              Start New Session
            </Button>
          </CardContent>
        </Card>
      </main>
    )
  }

  return (
    <div className="relative">
      <div className="fixed top-4 right-4 z-30">
        <CustomizationMenu
          darkMode={darkMode}
          timerDisplayMode={timerDisplayMode}
          breakRuleSummary={breakRuleSummary}
          onDarkModeChange={setDarkMode}
          onTimerDisplayModeChange={setTimerDisplayMode}
        />
      </div>
      <FocusSessionScreen
        task={task}
        remainingSeconds={remainingSeconds}
        progressPercent={progressPercent}
        timerDisplayMode={timerDisplayMode}
        viewMode={focusViewMode}
        pauseAllowed={pauseAllowed}
        pauseUsed={pauseUsed}
        pausedByUser={pausedByUser}
        checkInOpen={checkInOpen}
        breakOpen={breakOpen}
        currentCheckpoint={currentCheckpoint}
        selectedFeeling={selectedFeeling}
        customFeeling={customFeeling}
        expectsToFinishOnTime={expectsToFinishOnTime}
        media={mediaSelection}
        showCelebration={showCelebration}
        completedMinutes={completedMinutes}
        onCheckInYes={handleCheckpointYes}
        onCheckInNo={handleCheckpointNo}
        onFeelingChange={setSelectedFeeling}
        onCustomFeelingChange={setCustomFeeling}
        onExpectsToFinishChange={setExpectsToFinishOnTime}
        onCloseBreakPanel={handleCloseBreakPanel}
        onResumeFromBreak={handleResumeFromBreak}
        onSwitchTask={goToDashboard}
        onEndSession={goToDashboard}
        onStuck={handleStuck}
        onDoneEarly={handleDoneEarly}
        onPauseToggle={handlePauseToggle}
        onMediaChange={setMediaSelection}
        onEnterFullscreenClock={handleEnterFullscreenClock}
        onEnterMiniClock={handleEnterMiniClock}
        onExitSpecialView={handleExitSpecialView}
        onStartAnotherSession={handleStartAnotherSession}
      />
    </div>
  )
}
