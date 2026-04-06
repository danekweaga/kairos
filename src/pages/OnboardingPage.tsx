import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/context/AuthContext"
import type { OnboardingFormValues } from "@/lib/kairos-types"
import { clampNumber, sanitizeText, truncateText } from "@/lib/validation"

const DEFAULT_PREFERRED_LANGUAGE = "english"

export function OnboardingPage() {
  const navigate = useNavigate()
  const { profile, saveOnboarding, loading, error } = useAuth()
  const [step, setStep] = useState(1)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [form, setForm] = useState<OnboardingFormValues>({
    role: profile?.role ?? "",
    preferred_language: profile?.preferred_language ?? "",
    main_goal: profile?.main_goal ?? "",
    preferred_session_length: profile?.preferred_session_length ?? 25,
    audio_preference: profile?.audio_preference ?? "",
    guidance_style: profile?.guidance_style ?? "",
  })

  const isStepValid = useMemo(() => {
    if (step === 1) {
      return Boolean(form.role)
    }
    if (step === 2) {
      return (form.main_goal ?? "").trim().length > 0 && Number.isFinite(Number(form.preferred_session_length))
    }
    return Boolean(form.audio_preference) && Boolean(form.guidance_style)
  }, [form, step])

  async function handleFinish() {
    if (!isStepValid) return
    setSubmitError(null)

    try {
      const sanitizedGoal = sanitizeText(form.main_goal ?? "", 500)
      const sessionLength = clampNumber(Number(form.preferred_session_length), 15, 240, 25)
      await saveOnboarding({
        role: form.role,
        preferred_language: profile?.preferred_language?.trim() || DEFAULT_PREFERRED_LANGUAGE,
        main_goal: sanitizedGoal,
        preferred_session_length: sessionLength,
        audio_preference: form.audio_preference,
        guidance_style: form.guidance_style,
      })
      navigate("/home", { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save onboarding.")
    }
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-2xl items-center p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Onboarding</CardTitle>
          <CardDescription>Step {step} of 3 — personalize your Kairos experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 ? (
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={form.role ?? ""}
                onValueChange={(value) => setForm((prev) => ({ ...prev, role: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="creator">Creator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Main goal</Label>
                <Input
                  value={form.main_goal ?? ""}
                  maxLength={500}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, main_goal: truncateText(event.target.value, 500) }))
                  }
                  placeholder="Example: Raise my exam scores"
                />
              </div>
              <div className="space-y-2">
                <Label>Preferred session length (minutes)</Label>
                <Input
                  type="number"
                  min={15}
                  max={240}
                  step={5}
                  value={form.preferred_session_length ?? 25}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      preferred_session_length: clampNumber(Number(event.target.value), 15, 240, 25),
                    }))
                  }
                />
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Audio preference</Label>
                <Select
                  value={form.audio_preference ?? ""}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, audio_preference: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose audio preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="silence">Silence</SelectItem>
                    <SelectItem value="lofi">Lo-fi</SelectItem>
                    <SelectItem value="ambient">Ambient</SelectItem>
                    <SelectItem value="instrumental">Instrumental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Guidance style</Label>
                <Select
                  value={form.guidance_style ?? ""}
                  onValueChange={(value) => setForm((prev) => ({ ...prev, guidance_style: value }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="balanced">Balanced</SelectItem>
                    <SelectItem value="coaching">Coaching</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : null}

          {(submitError || error) ? (
            <p className="text-sm text-destructive">{submitError ?? error}</p>
          ) : null}

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={step === 1 || loading}
              onClick={() => setStep((current) => Math.max(1, current - 1))}
            >
              Back
            </Button>
            {step < 3 ? (
              <Button
                type="button"
                disabled={!isStepValid || loading}
                onClick={() => setStep((current) => Math.min(3, current + 1))}
              >
                Next
              </Button>
            ) : (
              <Button type="button" disabled={!isStepValid || loading} onClick={handleFinish}>
                {loading ? "Saving..." : "Complete Onboarding"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
