import type { EnergyLevel, MediaSelection, Task, TimerDisplayMode } from "@/lib/kairos-types"

export const STORAGE_KEYS = {
  dashboard: "kairos.dashboardState",
  activeSession: "kairos.activeSession",
} as const

export type PersistedDashboardState = {
  tasks: Task[]
  energyLevel: EnergyLevel
  darkMode: boolean
  timerDisplayMode: TimerDisplayMode
  mediaSelection: MediaSelection
}

export type PersistedActiveSession = {
  task: Task
  mediaSelection: MediaSelection
  timerDisplayMode: TimerDisplayMode
  darkMode: boolean
  sessionTotalSeconds: number
  remainingSeconds: number
  isRunning: boolean
  currentCheckpoint: number
  checkpointHistory: number[]
  breakCount: number
  pauseUsed: number
  pausedByUser: boolean
}

export function isBrowser(): boolean {
  return typeof window !== "undefined"
}

export function readJSON<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback

  try {
    const rawValue = window.localStorage.getItem(key)
    if (!rawValue) return fallback
    return JSON.parse(rawValue) as T
  } catch {
    return fallback
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (!isBrowser()) return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Persisting state is best-effort only.
  }
}

export function removeStoredValue(key: string): void {
  if (!isBrowser()) return

  try {
    window.localStorage.removeItem(key)
  } catch {
    // Storage cleanup is best-effort only.
  }
}
