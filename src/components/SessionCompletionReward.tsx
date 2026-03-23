import { CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type SessionCompletionRewardProps = {
  open: boolean
  completedMinutes: number
  onStartAnotherSession: () => void
  onReturnToDashboard: () => void
}

export function SessionCompletionReward({
  open,
  completedMinutes,
  onStartAnotherSession,
  onReturnToDashboard,
}: SessionCompletionRewardProps) {
  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex justify-center">
            <CheckCircle2 className="size-14 animate-in zoom-in-95 text-emerald-500 duration-500" />
          </div>
          <DialogTitle className="text-center text-xl">Session Complete</DialogTitle>
          <DialogDescription className="text-center">
            You stayed focused for {completedMinutes} minutes.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 p-4 text-center text-sm text-muted-foreground animate-in fade-in-0 duration-500">
          Nice work - you made intentional progress.
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button type="button" variant="outline" onClick={onStartAnotherSession}>
            Start another session
          </Button>
          <Button type="button" onClick={onReturnToDashboard}>
            Return to dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
