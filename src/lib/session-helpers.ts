import type { EnergyLevel, FeelingQuick, Task, TaskType } from "@/lib/kairos-types"

export const energyToTaskType: Record<EnergyLevel, TaskType> = {
  low: "shallow",
  medium: "medium",
  high: "deep",
}

export function calculateRoi(task: Task): number {
  return task.weight / task.estimatedHours
}

export function getRecommendedTask(tasks: Task[], energyLevel: EnergyLevel): Task | undefined {
  const preferredType = energyToTaskType[energyLevel]
  return [...tasks]
    .sort((a, b) => calculateRoi(b) - calculateRoi(a))
    .find((task) => task.type === preferredType)
}

export function getCheckpointStage(progressPercent: number): 25 | 50 | 75 | 100 | null {
  if (progressPercent >= 100) return 100
  if (progressPercent >= 75) return 75
  if (progressPercent >= 50) return 50
  if (progressPercent >= 25) return 25
  return null
}

export function classifyFeeling(quickFeeling: FeelingQuick | "", customFeeling: string): FeelingQuick | "custom" {
  if (quickFeeling) return quickFeeling
  return customFeeling.trim().length > 0 ? "custom" : "tired"
}

export function getBreakRecommendation(params: {
  feeling: FeelingQuick | "custom"
  stage: number
  totalMinutes: number
}): { minutes: number; explanation: string; suggestion: string } {
  const { feeling, stage, totalMinutes } = params

  let minutes = 5
  let explanation = "A short break can help reset your focus."
  let suggestion = "Stand up, stretch your shoulders, and hydrate."

  if (feeling === "tired") {
    minutes = 5
    explanation = "You seem mentally fatigued."
    suggestion = "Rest your eyes and take a few deep breaths."
  } else if (feeling === "distracted") {
    minutes = 3
    explanation = "You seem distracted right now."
    suggestion = "Take a brief walk and restart with one clear micro-goal."
  } else if (feeling === "overwhelmed") {
    minutes = 8
    explanation = "You seem overloaded."
    suggestion = "Step away, breathe, and return with a smaller next step."
  } else if (feeling === "mentally blocked") {
    minutes = 10
    explanation = "You seem blocked on the current approach."
    suggestion = "Switch strategy or review an easier sub-problem first."
  }

  if (stage >= 75) minutes += 1
  if (totalMinutes >= 90) minutes += 1

  return {
    minutes,
    explanation,
    suggestion,
  }
}

export function extendSessionByQuarter(totalSeconds: number): number {
  return Math.ceil(totalSeconds * 1.25)
}

export function formatDuration(seconds: number): string {
  const safe = Math.max(0, seconds)
  const mins = Math.floor(safe / 60)
  const secs = safe % 60
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

export function detectMediaSource(url: string):
  | "spotify"
  | "youtube"
  | "soundcloud"
  | "apple"
  | "audio"
  | "unknown" {
  const value = url.toLowerCase()
  if (/\.(mp3|wav|m4a)(\?.*)?$/.test(value)) return "audio"
  if (value.includes("open.spotify.com")) return "spotify"
  if (value.includes("youtube.com") || value.includes("youtu.be")) return "youtube"
  if (value.includes("soundcloud.com")) return "soundcloud"
  if (value.includes("music.apple.com")) return "apple"
  return "unknown"
}

export function isDirectAudioUrl(url: string): boolean {
  return detectMediaSource(url) === "audio"
}

export function getEmbeddableMedia(url: string): { source: string; embedUrl: string } | null {
  const source = detectMediaSource(url)

  if (source === "spotify") {
    const match = url.match(/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/)
    if (!match) return null
    return { source, embedUrl: `https://open.spotify.com/embed/${match[1]}/${match[2]}` }
  }

  if (source === "youtube") {
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/)
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/)
    const playlistMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/)
    const videoId = shortMatch?.[1] ?? watchMatch?.[1]

    if (videoId) {
      return { source, embedUrl: `https://www.youtube.com/embed/${videoId}` }
    }
    if (playlistMatch?.[1]) {
      return { source, embedUrl: `https://www.youtube.com/embed/videoseries?list=${playlistMatch[1]}` }
    }
    return null
  }

  if (source === "soundcloud") {
    return {
      source,
      embedUrl: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}`,
    }
  }

  return null
}

export function getPauseAllowance(taskMinutes: number, breakCount: number): number {
  const base = Math.max(1, Math.floor(taskMinutes / 30))
  const bonus = Math.floor(breakCount / 2)
  return base + bonus
}
