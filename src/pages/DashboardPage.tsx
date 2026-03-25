import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { CustomizationMenu } from "@/components/CustomizationMenu"
import { EnergySelector } from "@/components/EnergySelector"
import { MediaSelector } from "@/components/MediaSelector"
import { RecommendationCard } from "@/components/RecommendationCard"
import { RoiRankingCard } from "@/components/RoiRankingCard"
import { TaskForm } from "@/components/TaskForm"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import type { EnergyLevel, MediaSelection, Task, TimerDisplayMode } from "@/lib/kairos-types"
import { calculateRoi, getRecommendedTask } from "@/lib/session-helpers"
import {
  readJSON,
  STORAGE_KEYS,
  type PersistedActiveSession,
  type PersistedDashboardState,
  writeJSON,
} from "@/lib/storage"
import {
  sanitizeEnergyLevel,
  sanitizeMediaSelection,
  sanitizeTasks,
  sanitizeTimerDisplayMode,
} from "@/lib/validation"

const defaultMediaSelection: MediaSelection = {
  source: "none",
  url: "",
  title: "",
}

const defaultDashboardState: PersistedDashboardState = {
  tasks: [],
  energyLevel: "medium",
  darkMode: false,
  timerDisplayMode: "large",
  mediaSelection: defaultMediaSelection,
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [restoredDashboardState] = useState<PersistedDashboardState>(() => {
    const restored = readJSON<PersistedDashboardState>(STORAGE_KEYS.dashboard, defaultDashboardState)
    return {
      tasks: sanitizeTasks(restored.tasks),
      energyLevel: sanitizeEnergyLevel(restored.energyLevel),
      darkMode: Boolean(restored.darkMode),
      timerDisplayMode: sanitizeTimerDisplayMode(restored.timerDisplayMode),
      mediaSelection: sanitizeMediaSelection(restored.mediaSelection),
    }
  })

  const [tasks, setTasks] = useState<Task[]>(restoredDashboardState.tasks)
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel>(restoredDashboardState.energyLevel)
  const [darkMode, setDarkMode] = useState(restoredDashboardState.darkMode)
  const [timerDisplayMode, setTimerDisplayMode] = useState<TimerDisplayMode>(
    restoredDashboardState.timerDisplayMode
  )
  const [mediaSelection, setMediaSelection] = useState<MediaSelection>(
    restoredDashboardState.mediaSelection
  )

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => calculateRoi(b) - calculateRoi(a)),
    [tasks]
  )
  const highestRoiTask = sortedTasks[0]
  const recommendedTask = useMemo(
    () => getRecommendedTask(sortedTasks, energyLevel),
    [energyLevel, sortedTasks]
  )

  function handleAddTask(task: Omit<Task, "id">) {
    setTasks((current) => [...current, { id: Date.now(), ...task }])
  }

  function handleStartSession() {
    if (!recommendedTask) return

    const totalSeconds = Math.max(300, Math.round(recommendedTask.estimatedHours * 3600))
    const initialActiveSession: PersistedActiveSession = {
      task: recommendedTask,
      mediaSelection: sanitizeMediaSelection(mediaSelection),
      timerDisplayMode: sanitizeTimerDisplayMode(timerDisplayMode),
      darkMode,
      sessionTotalSeconds: totalSeconds,
      remainingSeconds: totalSeconds,
      isRunning: true,
      currentCheckpoint: 25,
      checkpointHistory: [],
      breakCount: 0,
      pauseUsed: 0,
      pausedByUser: false,
    }
    writeJSON(STORAGE_KEYS.activeSession, initialActiveSession)

    navigate("/focus", {
      state: {
        task: recommendedTask,
        media: mediaSelection,
        timerDisplayMode,
        darkMode,
      },
    })
  }

  const breakRuleSummary =
    "You get 1 pause per 30 minutes, minimum 1. Every 2 breaks adds 1 extra pause."

  useEffect(() => {
    if (typeof document === "undefined") return
    document.documentElement.classList.toggle("dark", darkMode)
  }, [darkMode])

  useEffect(() => {
    writeJSON<PersistedDashboardState>(STORAGE_KEYS.dashboard, {
      tasks,
      energyLevel: sanitizeEnergyLevel(energyLevel),
      darkMode,
      timerDisplayMode: sanitizeTimerDisplayMode(timerDisplayMode),
      mediaSelection: sanitizeMediaSelection(mediaSelection),
    })
  }, [darkMode, energyLevel, mediaSelection, tasks, timerDisplayMode])

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Planning Dashboard</CardTitle>
            <CustomizationMenu
              darkMode={darkMode}
              timerDisplayMode={timerDisplayMode}
              breakRuleSummary={breakRuleSummary}
              onDarkModeChange={setDarkMode}
              onTimerDisplayModeChange={setTimerDisplayMode}
            />
          </div>
          <CardDescription>Plan your highest-impact effort before starting a session.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => navigate("/home")}>
            Back to Home
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/how-to-use")}>
            How to Use
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={async () => {
              await signOut()
              navigate("/", { replace: true })
            }}
          >
            Logout
          </Button>
        </CardContent>
      </Card>

      <TaskForm onAddTask={handleAddTask} />
      <RoiRankingCard sortedTasks={sortedTasks} highestRoiTaskId={highestRoiTask?.id} />
      <EnergySelector energyLevel={energyLevel} onChange={setEnergyLevel} />
      <MediaSelector media={mediaSelection} onChange={setMediaSelection} />
      <RecommendationCard
        energyLevel={energyLevel}
        recommendedTask={recommendedTask}
        onStartSession={handleStartSession}
      />
    </main>
  )
}
