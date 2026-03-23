import { useMemo } from "react"

import { FeelingInput } from "@/components/FeelingInput"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { FeelingQuick } from "@/lib/kairos-types"
import { classifyFeeling, getBreakRecommendation } from "@/lib/session-helpers"

type BreakRecommendationModalProps = {
  open: boolean
  onClose: () => void
  stage: number
  totalMinutes: number
  selectedFeeling: FeelingQuick | ""
  customFeeling: string
  expectsToFinishOnTime: boolean | null
  onFeelingChange: (value: FeelingQuick) => void
  onCustomFeelingChange: (value: string) => void
  onExpectsToFinishChange: (value: boolean) => void
  onResume: () => void
  onSwitchTask: () => void
  onEndSession: () => void
}

export function BreakRecommendationModal({
  open,
  onClose,
  stage,
  totalMinutes,
  selectedFeeling,
  customFeeling,
  expectsToFinishOnTime,
  onFeelingChange,
  onCustomFeelingChange,
  onExpectsToFinishChange,
  onResume,
  onSwitchTask,
  onEndSession,
}: BreakRecommendationModalProps) {
  const recommendation = useMemo(() => {
    const feeling = classifyFeeling(selectedFeeling, customFeeling)
    return getBreakRecommendation({
      feeling,
      stage,
      totalMinutes,
    })
  }, [customFeeling, selectedFeeling, stage, totalMinutes])

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => (!nextOpen ? onClose() : undefined)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-5 sm:max-w-xl sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg">Break Recommendation</DialogTitle>
          <DialogDescription>
            Let’s quickly adjust so this study block becomes productive again.
          </DialogDescription>
        </DialogHeader>

        <FeelingInput
          selectedFeeling={selectedFeeling}
          customFeeling={customFeeling}
          onFeelingChange={onFeelingChange}
          onCustomFeelingChange={onCustomFeelingChange}
        />

        <div className="rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed">
          <p className="font-medium">{recommendation.explanation}</p>
          <p className="text-muted-foreground">Take a {recommendation.minutes}-minute break.</p>
          <p className="text-muted-foreground">{recommendation.suggestion}</p>
        </div>

        <div className="rounded-lg border p-4 text-sm">
          <p className="mb-2 font-medium">Do you think you will finish in your estimated time?</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={expectsToFinishOnTime === true ? "default" : "outline"}
              onClick={() => onExpectsToFinishChange(true)}
            >
              Yes
            </Button>
            <Button
              type="button"
              variant={expectsToFinishOnTime === false ? "default" : "outline"}
              onClick={() => onExpectsToFinishChange(false)}
            >
              No
            </Button>
          </div>
          {expectsToFinishOnTime === false ? (
            <p className="mt-2 text-muted-foreground">
              Session time will extend by 25% when you resume.
            </p>
          ) : null}
        </div>

        <DialogFooter className="sticky bottom-0 gap-2 border-t bg-background/95 backdrop-blur-sm sm:justify-between">
          <Button type="button" variant="outline" onClick={onSwitchTask}>
            Switch Task
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onEndSession}>
              End Session
            </Button>
            <Button type="button" onClick={onResume}>
              Resume Task
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
