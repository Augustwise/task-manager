import { useEffect, useState } from "react";
import type { TaskDto } from "../../../shared/types";
import { t } from "../../../shared/i18n";
import { getTasks } from "../api/tasksApi";
import { isTaskDeleted } from "../lib/archive";
import { getTaskSummary } from "../lib/getTaskSummary";
import type { PriorityFilter, SortOption, StatusFilter } from "../types/model";
import { getFilteredTasks } from "./taskFilters";

export function useTaskQueries() {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("due-date");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

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
