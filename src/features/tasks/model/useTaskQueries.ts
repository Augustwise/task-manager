import { useEffect, useState } from "react";
import type { TaskDto } from "../../../shared/types";
import { t } from "../../../shared/i18n";
import { getTasks } from "../api/tasksApi";
import { isTaskDeleted } from "../lib/archive";
import { getTaskSummary } from "../lib/getTaskSummary";
import type { PriorityFilter, SortOption, StatusFilter } from "../types/model";
import { getFilteredTasks } from "./taskFilters";

const SORT_BY_STORAGE_KEY = "tasks.sortBy";
const SORT_OPTION_VALUES: ReadonlySet<SortOption> = new Set([
  "manual",
  "due-date",
  "priority",
  "created",
]);

function readStoredSortBy(): SortOption {
  if (typeof window === "undefined") {
    return "due-date";
  }

  const stored = window.localStorage.getItem(SORT_BY_STORAGE_KEY);

  return stored && SORT_OPTION_VALUES.has(stored as SortOption)
    ? (stored as SortOption)
    : "due-date";
}

function persistSortBy(value: SortOption) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SORT_BY_STORAGE_KEY, value);
}

export function useTaskQueries() {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortByState] = useState<SortOption>(readStoredSortBy);
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  function setSortBy(value: SortOption) {
    persistSortBy(value);
    setSortByState(value);
  }

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      try {
        const nextTasks = await getTasks();

        if (!isMounted) {
          return;
        }

        setTasks(nextTasks);
        setError(null);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(err instanceof Error ? err.message : t("tasks.errors.loadTasks"));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  async function reloadTasks() {
    const nextTasks = await getTasks();

    setTasks(nextTasks);
    setError(null);

    return nextTasks;
  }

  const filteredTasks = getFilteredTasks(tasks, searchQuery, statusFilter, priorityFilter, sortBy);
  const liveTasks = tasks.filter((task) => !isTaskDeleted(task));
  const activeTasks = filteredTasks.filter((task) => !isTaskDeleted(task) && !task.completed);
  const completedTasks = filteredTasks.filter((task) => !isTaskDeleted(task) && task.completed);
  const deletedTasks = filteredTasks.filter((task) => isTaskDeleted(task));

  return {
    tasks,
    liveTasks,
    setTasks,
    isLoading,
    error,
    reloadTasks,
    searchQuery,
    sortBy,
    priorityFilter,
    statusFilter,
    setSearchQuery,
    setSortBy,
    setPriorityFilter,
    setStatusFilter,
    filteredTasks,
    activeTasks,
    completedTasks,
    deletedTasks,
    visibleCount: filteredTasks.length,
    summary: getTaskSummary(liveTasks),
  };
}
