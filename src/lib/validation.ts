import type {
  EnergyLevel,
  FocusViewMode,
  MediaSelection,
  MediaSource,
  Task,
  TaskType,
  TimerDisplayMode,
} from "@/lib/kairos-types"

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const SAFE_MEDIA_PROTOCOLS = new Set(["http:", "https:"])
const MEDIA_SOURCES: MediaSource[] = ["none", "spotify", "youtube", "soundcloud", "apple", "audio", "preset"]
const ENERGY_LEVELS: EnergyLevel[] = ["low", "medium", "high"]
const TIMER_MODES: TimerDisplayMode[] = ["large", "compact"]
const TASK_TYPES: TaskType[] = ["deep", "medium", "shallow"]
const VIEW_MODES: FocusViewMode[] = ["default", "fullscreen", "mini"]

export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase()
}

export function isValidEmail(input: string): boolean {
  return EMAIL_REGEX.test(normalizeEmail(input))
}

export function validatePasswordStrength(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters."
  if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    return "Password must include at least one letter and one number."
  }
  return null
}

export function sanitizeText(input: string, maxLength: number): string {
  return input.trim().slice(0, maxLength)
}

/** Length cap only; preserves spaces while typing (use sanitizeText on submit). */
export function truncateText(input: string, maxLength: number): string {
  return input.slice(0, maxLength)
}

export function clampNumber(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, value))
}

export function sanitizeTask(input: Task): Task {
  return {
    id: Math.round(clampNumber(Number(input.id), 1, Number.MAX_SAFE_INTEGER, Date.now())),
    name: sanitizeText(String(input.name ?? ""), 120) || "Untitled Task",
    weight: clampNumber(Number(input.weight), 1, 100, 1),
    estimatedHours: clampNumber(Number(input.estimatedHours), 0.25, 200, 1),
    type: TASK_TYPES.includes(input.type) ? input.type : "medium",
  }
}

export function sanitizeTaskDraft(input: { name: string; weight: number; estimatedHours: number; type: TaskType }) {
  return {
    name: sanitizeText(input.name, 120),
    weight: clampNumber(input.weight, 1, 100, 1),
    estimatedHours: clampNumber(input.estimatedHours, 0.25, 200, 1),
    type: TASK_TYPES.includes(input.type) ? input.type : "medium",
  }
}

export function sanitizeTasks(input: Task[]): Task[] {
  if (!Array.isArray(input)) return []
  return input.map((task) => sanitizeTask(task))
}

export function isValidHttpUrl(rawValue: string): boolean {
  try {
    const parsed = new URL(rawValue)
    return SAFE_MEDIA_PROTOCOLS.has(parsed.protocol)
  } catch {
    return false
  }
}

export function sanitizeMediaSelection(input: MediaSelection): MediaSelection {
  const source = MEDIA_SOURCES.includes(input.source) ? input.source : "none"
  const trimmedUrl = String(input.url ?? "").trim()
  const safeUrl = trimmedUrl && isValidHttpUrl(trimmedUrl) ? trimmedUrl : ""

  return {
    source,
    title: sanitizeText(String(input.title ?? ""), 120),
    url: safeUrl,
  }
}

export function sanitizeEnergyLevel(value: EnergyLevel): EnergyLevel {
  return ENERGY_LEVELS.includes(value) ? value : "medium"
}

export function sanitizeTimerDisplayMode(value: TimerDisplayMode): TimerDisplayMode {
  return TIMER_MODES.includes(value) ? value : "large"
}

export function sanitizeFocusViewMode(value: FocusViewMode): FocusViewMode {
  return VIEW_MODES.includes(value) ? value : "default"
}
