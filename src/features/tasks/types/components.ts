import type { SubmitEvent } from "react";
import type { CreateTaskDto, Priority, TaskDto } from "../../../shared/types";
import type {
  PriorityFilter,
  SortOption,
  StatusFilter,
  TaskFormErrors,
  TasksPageModel,
} from "./model";

export interface CreateTaskModalProps {
  readonly isOpen: boolean;
  readonly mode: "create" | "edit";
  readonly formValues: CreateTaskDto;
  readonly fieldErrors: TaskFormErrors;
  readonly formError: string | null;
  readonly isSubmitting: boolean;
  readonly onClose: () => void;
  readonly onFieldChange: (field: keyof CreateTaskDto, value: string) => void;
  readonly onSubtaskAdd: (title: string) => void;
  readonly onSubtaskRemove: (index: number) => void;
  readonly onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
}

export type TaskCardCheckboxMode = "complete" | "select";

export interface TaskCardProps {
  readonly task: TaskDto;
  readonly isUpdating: boolean;
  readonly checkboxMode: TaskCardCheckboxMode;
  readonly isSelected?: boolean;
  readonly onCompletionChange: (taskId: number, completed: boolean) => void;
  readonly onSelectionChange?: (taskId: number, selected: boolean) => void;
  readonly onSubtaskCompletionChange: (taskId: number, subtaskId: number, completed: boolean) => void;
  readonly onEditClick: (task: TaskDto) => void;
  readonly onDeleteClick: (task: TaskDto) => void;
  readonly onRestoreClick?: (task: TaskDto) => void;
  readonly onShareClick: (task: TaskDto) => void;
  readonly onShareRevokeClick: (task: TaskDto) => void;
}


export interface TaskDeleteModalProps {
  readonly isOpen: boolean;
  readonly taskTitle: string;
  readonly taskCount: number;
  readonly error: string | null;
  readonly isDeleting: boolean;
  readonly onClose: () => void;
  readonly onConfirm: () => void;
}

export interface TaskErrorModalProps {
  readonly open: boolean;
  readonly message: string;
  readonly onClose: () => void;
}

export interface TaskListSectionProps {
  readonly title: string;
  readonly tasks: readonly TaskDto[];
  readonly pendingTaskIds: readonly number[];
  readonly selectedTaskIds: readonly number[];
  readonly onTaskCompletionChange: (taskId: number, completed: boolean) => void;
  readonly onTaskSelectionChange: (taskId: number, selected: boolean) => void;
  readonly onSubtaskCompletionChange: (taskId: number, subtaskId: number, completed: boolean) => void;
  readonly onTaskEditClick: (task: TaskDto) => void;
  readonly onTaskDeleteClick: (task: TaskDto) => void;
  readonly onTaskRestoreClick?: (task: TaskDto) => void;
  readonly onTaskShareClick: (task: TaskDto) => void;
  readonly onTaskShareRevokeClick: (task: TaskDto) => void;
}


export interface TasksCalendarViewProps {
  readonly model: TasksPageModel;
}

export interface TasksHeaderProps {
  readonly pending: number;
  readonly done: number;
  readonly total: number;
  readonly subtitle?: string;
}

export interface TasksListViewProps {
  readonly model: TasksPageModel;
}

export interface TasksBulkActionBarProps {
  readonly selectedCount: number;
  readonly selectedTasks: readonly TaskDto[];
  readonly canUpdateCompletion: boolean;
  readonly isPending: boolean;
  readonly showRestoreAction: boolean;
  readonly completionAction: "complete" | "activate";
  readonly onUpdateCompletion: () => Promise<boolean>;
  readonly onRestore: () => Promise<boolean>;
  readonly onDelete: () => void;
  readonly onClearSelection: () => void;
  readonly onApplyPriority: (priority: Priority) => Promise<boolean>;
}

export interface TasksProgressProps {
  readonly done: number;
  readonly total: number;
  readonly progressPct: number;
}

export interface TasksToolbarProps {
  readonly searchQuery: string;
  readonly sortBy: SortOption;
  readonly priorityFilter: PriorityFilter;
  readonly statusFilter: StatusFilter;
  readonly onCreateTaskClick: () => void;
  readonly onSearchQueryChange: (value: string) => void;
  readonly onSortByChange: (value: SortOption) => void;
  readonly onPriorityFilterChange: (value: PriorityFilter) => void;
  readonly onStatusFilterChange: (value: StatusFilter) => void;
}
