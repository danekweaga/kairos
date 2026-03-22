import { Badge } from "@/components/ui/badge"
import type { Task } from "@/lib/kairos-types"
import { calculateRoi } from "@/lib/session-helpers"

type TaskListProps = {
  tasks: Task[]
  highestRoiTaskId?: number
}

export function TaskList({ tasks, highestRoiTaskId }: TaskListProps) {
  if (tasks.length === 0) {
    return <p className="text-sm text-muted-foreground">No tasks yet. Add your first task above.</p>
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => {
        const isHighestRoi = highestRoiTaskId === task.id
        return (
          <div
            key={task.id}
            className={`rounded-lg border p-3 ${isHighestRoi ? "border-primary bg-muted/40" : ""}`}
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="font-medium">{task.name}</p>
              {isHighestRoi ? <Badge>Highest ROI</Badge> : null}
            </div>
            <div className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-4">
              <p>Weight: {task.weight}%</p>
              <p>Time: {task.estimatedHours}h</p>
              <p>Type: {task.type}</p>
              <p>ROI: {calculateRoi(task).toFixed(2)}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
