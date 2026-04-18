import type { TaskDto } from "../../../shared/types";

export const TASK_ARCHIVE_RETENTION_DAYS = 7;

export function isTaskDeleted(task: Pick<TaskDto, "deletedAt">): boolean {
  return task.deletedAt.trim().length > 0;
}

export function getTaskRestoreDeadline(task: Pick<TaskDto, "restoreAvailableUntil">): Date | null {
  if (!task.restoreAvailableUntil) {
    return null;
  }

  const deadline = new Date(task.restoreAvailableUntil);

  return Number.isNaN(deadline.getTime()) ? null : deadline;
}
