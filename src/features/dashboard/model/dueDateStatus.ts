import type { TaskDto } from "../../../shared/types";

export type DueStatus = "overdue" | "dueToday" | "thisWeek" | "onTrack";

export function calculateDueStatus(task: TaskDto): DueStatus {
  if (!task.dueDate || task.completed) return "onTrack";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(task.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "dueToday";
  if (diffDays <= 7) return "thisWeek";

  return "onTrack";
}
