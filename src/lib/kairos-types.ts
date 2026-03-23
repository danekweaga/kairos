export type TaskType = "deep" | "medium" | "shallow"
export type EnergyLevel = "low" | "medium" | "high"

export type Task = {
  id: number
  name: string
  weight: number
  estimatedHours: number
  type: TaskType
}

export type FeelingQuick = "tired" | "distracted" | "overwhelmed" | "mentally blocked"

export type MediaSource =
  | "none"
  | "spotify"
  | "youtube"
  | "soundcloud"
  | "apple"
  | "audio"
  | "preset"

export type MediaSelection = {
  source: MediaSource
  url: string
  title: string
}

export type TimerDisplayMode = "large" | "compact"
export type FocusViewMode = "default" | "fullscreen" | "mini"

export type Profile = {
  id: string
  role: string | null
  preferred_language: string | null
  main_goal: string | null
  preferred_session_length: number | null
  audio_preference: string | null
  guidance_style: string | null
  onboarding_completed: boolean
}

export type OnboardingFormValues = Omit<Profile, "id" | "onboarding_completed"> & {
  onboarding_completed?: boolean
}
