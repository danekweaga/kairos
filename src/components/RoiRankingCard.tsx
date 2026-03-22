import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskList } from "@/components/TaskList"
import type { Task } from "@/lib/kairos-types"

type RoiRankingCardProps = {
  sortedTasks: Task[]
  highestRoiTaskId?: number
}

export function RoiRankingCard({ sortedTasks, highestRoiTaskId }: RoiRankingCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Task List + ROI Ranking</CardTitle>
        <CardDescription>Tasks are sorted by weight divided by estimated hours.</CardDescription>
      </CardHeader>
      <CardContent>
        <TaskList tasks={sortedTasks} highestRoiTaskId={highestRoiTaskId} />
      </CardContent>
    </Card>
  )
}
