import { useEffect, useMemo, useState } from "react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"

import { CustomizationMenu } from "@/components/CustomizationMenu"
import { FocusSessionScreen } from "@/components/FocusSessionScreen"
import type {
  FeelingQuick,
  FocusViewMode,
  MediaSelection,
  Task,
  TimerDisplayMode,
} from "@/lib/kairos-types"
import { extendSessionByQuarter, getCheckpointStage, getPauseAllowance } from "@/lib/session-helpers"

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

  const task = state?.task
  const [mediaSelection, setMediaSelection] = useState<MediaSelection>(
    state?.media ?? { source: "none", url: "", title: "" }
  )
  const [timerDisplayMode, setTimerDisplayMode] = useState<TimerDisplayMode>(
    state?.timerDisplayMode ?? "large"
  )
  const [darkMode, setDarkMode] = useState(Boolean(state?.darkMode))
  const [focusViewMode, setFocusViewMode] = useState<FocusViewMode>("default")

  const baseSeconds = useMemo(
    () => (task ? Math.max(300, Math.round(task.estimatedHours * 3600)) : 0),
    [task]
  )

  const [sessionTotalSeconds, setSessionTotalSeconds] = useState(baseSeconds)
  const [remainingSeconds, setRemainingSeconds] = useState(baseSeconds)
  const [isRunning, setIsRunning] = useState(true)
  const [currentCheckpoint, setCurrentCheckpoint] = useState(25)
  const [checkpointHistory, setCheckpointHistory] = useState<number[]>([])
  const [breakCount, setBreakCount] = useState(0)
  const [pauseUsed, setPauseUsed] = useState(0)
  const [pausedByUser, setPausedByUser] = useState(false)
  const [checkInOpen, setCheckInOpen] = useState(false)
  const [breakOpen, setBreakOpen] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [selectedFeeling, setSelectedFeeling] = useState<FeelingQuick | "">("")
  const [customFeeling, setCustomFeeling] = useState("")
  const [expectsToFinishOnTime, setExpectsToFinishOnTime] = useState<boolean | null>(null)

  const elapsedSeconds = Math.max(0, sessionTotalSeconds - remainingSeconds)
  const progressPercent =
    sessionTotalSeconds > 0 ? Math.min(100, (elapsedSeconds / sessionTotalSeconds) * 100) : 0
  const taskMinutes = task ? Math.max(1, Math.round(task.estimatedHours * 60)) : 0
  const pauseAllowed = getPauseAllowance(taskMinutes, breakCount)
  const breakRuleSummary =
    "You get 1 pause per 30 minutes, minimum 1. Every 2 breaks adds 1 extra pause."

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
  }, [darkMode])

  function resetInterventionState() {
    setSelectedFeeling("")
    setCustomFeeling("")
    setExpectsToFinishOnTime(null)
  }

  function goToDashboard() {
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined)
    }
    navigate("/dashboard", { replace: true })
  }

  function handleDoneEarly() {
    setIsRunning(false)
    setShowCelebration(true)
  }

  async function handleEnterFullscreenClock() {
    setFocusViewMode("fullscreen")
    if (document.fullscreenElement) return
    try {
      await document.documentElement.requestFullscreen()
    } catch {
      // Some browsers can reject fullscreen requests depending on user gesture context.
    }
  }

  function handleEnterMiniClock() {
    setFocusViewMode("mini")
    if (document.fullscreenElement) {
      void document.exitFullscreen().catch(() => undefined)
    }
  }

  async function handleExitSpecialView() {
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
    if (!isRunning || checkInOpen || breakOpen || showCelebration) return

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [breakOpen, checkInOpen, isRunning, showCelebration])

  useEffect(() => {
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

  if (!task) {
    return <Navigate to="/dashboard" replace />
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
      />
    </div>
  )
}
