import type { Priority, TaskDto } from "../../../shared/types";
import { isTaskDeleted } from "../lib/archive";
import type { PriorityFilter, SortOption, StatusFilter } from "../types/model";

const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function getDateValue(value: string): number {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }

  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
}

function matchesSearch(task: TaskDto, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [task.title, task.description, task.tag].some((value) =>
    value.toLowerCase().includes(normalizedQuery),
  );
}

function matchesStatus(task: TaskDto, statusFilter: StatusFilter): boolean {
  const deleted = isTaskDeleted(task);

  if (statusFilter === "deleted") {
    return deleted;
  }

  if (deleted) {
    return false;
  }

  if (statusFilter === "active") {
    return !task.completed;
  }

  if (statusFilter === "completed") {
    return task.completed;
  }

  return true;
}

function matchesPriority(task: TaskDto, priorityFilter: PriorityFilter): boolean {
  return priorityFilter === "all" || task.priority === priorityFilter;
}

export function getFilteredTasks(
  tasks: TaskDto[],
  searchQuery: string,
  statusFilter: StatusFilter,
  priorityFilter: PriorityFilter,
  sortBy: SortOption,
): TaskDto[] {
  return sortTasks(
    tasks.filter(
      (task) =>
        matchesSearch(task, searchQuery) &&
        matchesStatus(task, statusFilter) &&
        matchesPriority(task, priorityFilter),
    ),
    sortBy,
    statusFilter,
  );
}

function sortTasks(tasks: TaskDto[], sortBy: SortOption, statusFilter: StatusFilter): TaskDto[] {
  const sortedTasks = [...tasks];

  sortedTasks.sort((left, right) => {
    if (statusFilter === "deleted") {
      return (
        getDateValue(right.deletedAt) - getDateValue(left.deletedAt) ||
        right.id - left.id
      );
    }

    if (sortBy === "priority") {
      return (
        PRIORITY_ORDER[left.priority] - PRIORITY_ORDER[right.priority] ||
        getDateValue(left.dueDate) - getDateValue(right.dueDate) ||
        left.id - right.id
      );
    }

    if (sortBy === "created") {
      return (
        getDateValue(right.createdAt) - getDateValue(left.createdAt) ||
        left.id - right.id
      );
    }

    return getDateValue(left.dueDate) - getDateValue(right.dueDate) || left.id - right.id;
  });

  return sortedTasks;
}
