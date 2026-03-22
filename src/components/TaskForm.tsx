import { useMemo, useState } from "react"
import type { FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TaskType } from "@/lib/kairos-types"

type TaskFormProps = {
  onAddTask: (task: { name: string; weight: number; estimatedHours: number; type: TaskType }) => void
}

export function TaskForm({ onAddTask }: TaskFormProps) {
  const [taskName, setTaskName] = useState("")
  const [weight, setWeight] = useState("")
  const [estimatedHours, setEstimatedHours] = useState("")
  const [taskType, setTaskType] = useState<TaskType>("medium")

  const parsedWeight = Number(weight)
  const parsedHours = Number(estimatedHours)

  const isFormValid = useMemo(
    () =>
      taskName.trim().length > 0 &&
      Number.isFinite(parsedWeight) &&
      Number.isFinite(parsedHours) &&
      parsedWeight > 0 &&
      parsedWeight <= 100 &&
      parsedHours > 0,
    [parsedHours, parsedWeight, taskName]
  )

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isFormValid) return

    onAddTask({
      name: taskName.trim(),
      weight: parsedWeight,
      estimatedHours: parsedHours,
      type: taskType,
    })

    setTaskName("")
    setWeight("")
    setEstimatedHours("")
    setTaskType("medium")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Input</CardTitle>
        <CardDescription>Add a task to calculate its effort ROI.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="task-name">Task name</Label>
            <Input
              id="task-name"
              value={taskName}
              onChange={(event) => setTaskName(event.target.value)}
              placeholder="Example: Review calculus chapter"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-weight">Weight (%)</Label>
            <Input
              id="task-weight"
              type="number"
              min={1}
              max={100}
              value={weight}
              onChange={(event) => setWeight(event.target.value)}
              placeholder="25"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-hours">Estimated time (hours)</Label>
            <Input
              id="task-hours"
              type="number"
              min={0.25}
              step={0.25}
              value={estimatedHours}
              onChange={(event) => setEstimatedHours(event.target.value)}
              placeholder="2"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-type">Task type</Label>
            <Select value={taskType} onValueChange={(value) => setTaskType(value as TaskType)}>
              <SelectTrigger id="task-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deep">Deep</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="shallow">Shallow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end justify-end md:col-span-2">
            <Button type="submit" disabled={!isFormValid}>
              Add Task
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
