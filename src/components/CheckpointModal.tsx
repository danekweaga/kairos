import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type CheckpointModalProps = {
  open: boolean
  checkpoint: number
  onYes: () => void
  onNo: () => void
}

export function CheckpointModal({ open, checkpoint, onYes, onNo }: CheckpointModalProps) {
  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Are you making progress?</DialogTitle>
          <DialogDescription>
            You reached the {checkpoint}% checkpoint. Continue if it is working, or adjust if it is not.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onNo}>
            No
          </Button>
          <Button type="button" onClick={onYes}>
            Yes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
