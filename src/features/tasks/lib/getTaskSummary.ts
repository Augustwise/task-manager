import type { TaskDto } from "../../../shared/types";
import { isTaskDeleted } from "./archive";

export function getTaskSummary(tasks: TaskDto[]) {
  const liveTasks = tasks.filter((task) => !isTaskDeleted(task));
  const total = liveTasks.length;
  const done = liveTasks.filter((task) => task.completed).length;
  const pending = total - done;
  const progressPct = total === 0 ? 0 : Math.round((done / total) * 100);

  return { pending, done, total, progressPct };
}
