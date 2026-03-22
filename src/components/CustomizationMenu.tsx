import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TimerDisplayMode } from "@/lib/kairos-types"

type CustomizationMenuProps = {
  darkMode: boolean
  timerDisplayMode: TimerDisplayMode
  breakRuleSummary: string
  onDarkModeChange: (value: boolean) => void
  onTimerDisplayModeChange: (value: TimerDisplayMode) => void
}

export function CustomizationMenu({
  darkMode,
  timerDisplayMode,
  breakRuleSummary,
  onDarkModeChange,
  onTimerDisplayModeChange,
}: CustomizationMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="outline">Customize</Button>} />
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Session Customization</DialogTitle>
          <DialogDescription>
            Tune your focus setup quickly. Music is configured on the dashboard before starting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={!darkMode ? "default" : "outline"}
                onClick={() => onDarkModeChange(false)}
              >
                Light
              </Button>
              <Button
                type="button"
                variant={darkMode ? "default" : "outline"}
                onClick={() => onDarkModeChange(true)}
              >
                Dark
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Timer size</Label>
            <Select
              value={timerDisplayMode}
              onValueChange={(value) => onTimerDisplayModeChange(value as TimerDisplayMode)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="large">Large (immersive)</SelectItem>
                <SelectItem value="compact">Compact</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border p-3">
            <p className="font-medium">Break/Pause Rule</p>
            <p className="text-muted-foreground leading-relaxed">{breakRuleSummary}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
