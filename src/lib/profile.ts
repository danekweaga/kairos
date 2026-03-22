import type { OnboardingFormValues, Profile } from "@/lib/kairos-types"
import { supabase } from "@/lib/supabase"

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data as Profile | null
}

export async function createProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      onboarding_completed: false,
    })
    .select("*")
    .single()

  if (error) {
    throw error
  }

  return data as Profile
}

export async function updateProfile(
  userId: string,
  payload: Partial<OnboardingFormValues & { onboarding_completed: boolean }>
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", userId)
    .select("*")
    .single()

  if (error) {
    throw error
  }

  return data as Profile
}
