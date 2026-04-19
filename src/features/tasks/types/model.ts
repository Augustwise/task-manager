import type { CreateTaskDto, Priority, TaskDto } from "../../../shared/types";
import type { useTasksPageModel } from "../model/useTasksPageModel";

export type SortOption = "manual" | "due-date" | "priority" | "created";
export type StatusFilter = "all" | "active" | "completed" | "deleted";
export type PriorityFilter = "all" | Priority;
export type BulkAction = "complete" | "delete" | "priority" | "restore" | null;

export type DeleteTarget =
  | {
      mode: "single";
      task: TaskDto;
    }
  | {
      mode: "bulk";
      taskCount: number;
      taskIds: number[];
      taskTitle: string;
    };

export type TaskFormErrors = Partial<Record<keyof CreateTaskDto, string>>;

export type TasksPageModel = ReturnType<typeof useTasksPageModel>;
