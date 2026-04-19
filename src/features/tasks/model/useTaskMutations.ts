import { useState, type Dispatch, type SetStateAction, type SubmitEvent } from "react";
import type { CreateTaskDto, Priority, SubtaskDto, TaskDto } from "../../../shared/types";
import { t } from "../../../shared/i18n";
import {
  createShareLink,
  createTask,
  deleteTask,
  reorderTasks as apiReorderTasks,
  restoreTask as apiRestoreTask,
  revokeShareLink,
  toggleSubtaskCompletion as apiToggleSubtaskCompletion,
  updateTask,
  updateTaskCompletion,
} from "../api/tasksApi";
import type { BulkAction, DeleteTarget, TaskFormErrors } from "../types/model";
import { normalizeTaskFormValues, validateTaskForm } from "./taskForm";

function dedupeTaskIds(taskIds: number[]) {
  return [...new Set(taskIds)];
}

function getRejectedResultsTaskIds(
  taskIds: number[],
  results: PromiseSettledResult<unknown>[],
): number[] {
  return taskIds.filter((_, index) => results[index]?.status === "rejected");
}

function updateTaskSubtaskCompletion(
  tasks: TaskDto[],
  taskId: number,
  subtaskId: number,
  completed: boolean,
): TaskDto[] {
  return tasks.map((task) =>
    task.id === taskId
      ? {
          ...task,
          subtasks: task.subtasks.map((subtask) =>
            subtask.id === subtaskId ? { ...subtask, completed } : subtask,
          ),
        }
      : task,
  );
}

async function copyShareLink(shareToken: string) {
  const origin = globalThis.location?.origin;
  const clipboard = globalThis.navigator?.clipboard;

  if (!origin || !clipboard?.writeText) {
    throw new Error(t("tasks.share.clipboardUnsupported"));
  }

  await clipboard.writeText(`${origin}/shared/${shareToken}`);
}

interface TaskSelectionState {
  selectedTasks: TaskDto[];
  completionTarget: boolean;
  clearSelection: () => void;
  replaceSelection: (taskIds: number[]) => void;
}

interface TaskModalState {
  editingTaskId: number | null;
  formValues: CreateTaskDto;
  setFieldErrors: Dispatch<SetStateAction<TaskFormErrors>>;
  setFormError: Dispatch<SetStateAction<string | null>>;
  setIsSubmitting: Dispatch<SetStateAction<boolean>>;
  closeTaskModal: () => void;
}

interface DeleteModalState {
  deleteTarget: DeleteTarget | null;
  setDeleteError: Dispatch<SetStateAction<string | null>>;
  closeDeleteTaskModal: () => void;
}

interface UseTaskMutationsParams {
  tasks: TaskDto[];
  setTasks: Dispatch<SetStateAction<TaskDto[]>>;
  reloadTasks: () => Promise<TaskDto[]>;
  selection: TaskSelectionState;
  taskModal: TaskModalState;
  deleteModal: DeleteModalState;
}

export function useTaskMutations({
  tasks,
  setTasks,
  reloadTasks,
  selection,
  taskModal,
  deleteModal,
}: UseTaskMutationsParams) {
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [shareFeedbackMessage, setShareFeedbackMessage] = useState<string | null>(null);
  const [pendingTaskIds, setPendingTaskIds] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<BulkAction>(null);

  function addPendingTaskIds(taskIds: number[]) {
    const nextTaskIds = dedupeTaskIds(taskIds);

    if (nextTaskIds.length === 0) {
      return;
    }

    setPendingTaskIds((currentTaskIds) => dedupeTaskIds([...currentTaskIds, ...nextTaskIds]));
  }

  function removePendingTaskIds(taskIds: number[]) {
    if (taskIds.length === 0) {
      return;
    }

    const taskIdsToRemove = new Set(taskIds);

    setPendingTaskIds((currentTaskIds) =>
      currentTaskIds.filter((taskId) => !taskIdsToRemove.has(taskId)),
    );
  }

  async function onTaskSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedValues = normalizeTaskFormValues(taskModal.formValues);
    const nextErrors = validateTaskForm(trimmedValues);

    if (Object.keys(nextErrors).length > 0) {
      taskModal.setFieldErrors(nextErrors);
      return;
    }

    taskModal.setIsSubmitting(true);
    taskModal.setFieldErrors({});
    taskModal.setFormError(null);

    try {
      if (taskModal.editingTaskId === null) {
        const createdTask = await createTask(trimmedValues);

        setTasks((currentTasks) => [...currentTasks, createdTask]);
      } else {
        const existingTask = tasks.find((task) => task.id === taskModal.editingTaskId);
        const existingSubtasks: SubtaskDto[] = existingTask?.subtasks ?? [];
        const formSubtaskTitles = trimmedValues.subtasks ?? [];

        const updatedSubtasks = formSubtaskTitles.map((title, index) => {
          const existingSubtask = existingSubtasks[index];

          return existingSubtask ? { id: existingSubtask.id, title } : { title };
        });

        const updatedTask = await updateTask(taskModal.editingTaskId, {
          title: trimmedValues.title,
          description: trimmedValues.description,
          priority: trimmedValues.priority,
          dueDate: trimmedValues.dueDate,
          tag: trimmedValues.tag,
          recurrence: trimmedValues.recurrence,
          recurrenceEndDate: trimmedValues.recurrenceEndDate,
          subtasks: updatedSubtasks,
        });

        setTasks((currentTasks) =>
          currentTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
        );
      }

      taskModal.closeTaskModal();
    } catch (err) {
      taskModal.setFormError(err instanceof Error ? err.message : t("tasks.errors.saveTask"));
    } finally {
      taskModal.setIsSubmitting(false);
    }
  }

  async function toggleTaskCompletion(taskId: number, completed: boolean) {
    const previousTask = tasks.find((task) => task.id === taskId);

    if (!previousTask) {
      return;
    }

    const isRecurringCompletion =
      completed && previousTask.recurrence !== "none" && Boolean(previousTask.dueDate);

    if (!isRecurringCompletion) {
      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === taskId ? { ...task, completed } : task)),
      );
    }
    addPendingTaskIds([taskId]);

    try {
      const updatedTask = await updateTaskCompletion(taskId, { completed });

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      );
      setCompletionError(null);
    } catch (err) {
      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === previousTask.id ? previousTask : task)),
      );
      setCompletionError(err instanceof Error ? err.message : t("tasks.errors.updateTask"));
    } finally {
      removePendingTaskIds([taskId]);
    }
  }

  async function toggleSubtaskCompletion(taskId: number, subtaskId: number, completed: boolean) {
    const previousTask = tasks.find((task) => task.id === taskId);

    if (!previousTask) {
      return;
    }

    setTasks((currentTasks) =>
      updateTaskSubtaskCompletion(currentTasks, taskId, subtaskId, completed),
    );
    addPendingTaskIds([taskId]);

    try {
      const updatedTask = await apiToggleSubtaskCompletion(taskId, subtaskId, { completed });

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      );
      setCompletionError(null);
    } catch (err) {
      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === previousTask.id ? previousTask : task)),
      );
      setCompletionError(err instanceof Error ? err.message : t("tasks.errors.updateSubtask"));
    } finally {
      removePendingTaskIds([taskId]);
    }
  }

  async function runBulkTaskAction(
    taskIds: number[],
    action: Exclude<BulkAction, null>,
    runTaskAction: (taskId: number) => Promise<unknown>,
    partialFailureMessage: (failedCount: number) => string,
  ) {
    const nextTaskIds = dedupeTaskIds(taskIds);

    if (nextTaskIds.length === 0) {
      return true;
    }

    addPendingTaskIds(nextTaskIds);
    setBulkAction(action);
    deleteModal.setDeleteError(null);

    try {
      const results = await Promise.allSettled(
        nextTaskIds.map((taskId) => runTaskAction(taskId)),
      );
      const failedTaskIds = getRejectedResultsTaskIds(nextTaskIds, results);

      await reloadTasks();

      if (failedTaskIds.length > 0) {
        selection.replaceSelection(failedTaskIds);
        setCompletionError(partialFailureMessage(failedTaskIds.length));
        return false;
      }

      selection.clearSelection();
      setCompletionError(null);
      return true;
    } catch (err) {
      setCompletionError(err instanceof Error ? err.message : t("tasks.errors.loadTasks"));
      return false;
    } finally {
      removePendingTaskIds(nextTaskIds);
      setBulkAction(null);
    }
  }

  async function updateSelectedTasksCompletion() {
    const taskIdsToUpdate = selection.selectedTasks
      .filter((task) => task.completed !== selection.completionTarget)
      .map((task) => task.id);

    return runBulkTaskAction(
      taskIdsToUpdate,
      "complete",
      (taskId) => updateTaskCompletion(taskId, { completed: selection.completionTarget }),
      (failedCount) =>
        selection.completionTarget
          ? t("tasks.bulk.completePartialFailure", { count: failedCount })
          : t("tasks.bulk.activatePartialFailure", { count: failedCount }),
    );
  }

  async function updateSelectedTasksPriority(priority: Priority) {
    const tasksById = new Map(tasks.map((task) => [task.id, task]));
    const taskIdsToUpdate = selection.selectedTasks
      .filter((task) => task.priority !== priority)
      .map((task) => task.id);

    return runBulkTaskAction(
      taskIdsToUpdate,
      "priority",
      async (taskId) => {
        const task = tasksById.get(taskId);

        if (!task) {
          throw new Error(t("tasks.errors.updateTask"));
        }

        return updateTask(taskId, {
          title: task.title,
          description: task.description,
          priority,
          dueDate: task.dueDate,
          tag: task.tag,
          recurrence: task.recurrence,
          recurrenceEndDate: task.recurrenceEndDate,
          subtasks: task.subtasks.map((subtask) => ({
            id: subtask.id,
            title: subtask.title,
          })),
        });
      },
      (failedCount) => t("tasks.bulk.priorityPartialFailure", { count: failedCount }),
    );
  }

  async function shareTask(task: TaskDto) {
    addPendingTaskIds([task.id]);

    try {
      const nextTask = task.shareToken ? task : await createShareLink(task.id);

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) => (currentTask.id === nextTask.id ? nextTask : currentTask)),
      );

      if (!nextTask.shareToken) {
        throw new Error(t("tasks.share.generateFailed"));
      }

      await copyShareLink(nextTask.shareToken);
      setShareFeedbackMessage(t("tasks.share.linkCopied"));
      setCompletionError(null);
    } catch (err) {
      setShareFeedbackMessage(null);
      setCompletionError(err instanceof Error ? err.message : t("tasks.errors.copyShareLink"));
    } finally {
      removePendingTaskIds([task.id]);
    }
  }

  async function revokeTaskShare(task: TaskDto) {
    if (!task.shareToken) {
      return;
    }

    addPendingTaskIds([task.id]);

    try {
      const nextTask = await revokeShareLink(task.id);

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) => (currentTask.id === nextTask.id ? nextTask : currentTask)),
      );
      setCompletionError(null);
    } catch (err) {
      setCompletionError(err instanceof Error ? err.message : t("tasks.errors.revokeShareLink"));
    } finally {
      removePendingTaskIds([task.id]);
    }
  }

  async function restoreTask(taskId: number) {
    const previousTask = tasks.find((task) => task.id === taskId);

    if (!previousTask) {
      return;
    }

    addPendingTaskIds([taskId]);

    try {
      const restoredTask = await apiRestoreTask(taskId);

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === restoredTask.id ? restoredTask : task)),
      );
      setCompletionError(null);
    } catch (err) {
      setCompletionError(err instanceof Error ? err.message : t("tasks.errors.restoreTask"));
    } finally {
      removePendingTaskIds([taskId]);
    }
  }

  async function restoreSelectedTasks() {
    const taskIdsToRestore = selection.selectedTasks.map((task) => task.id);

    return runBulkTaskAction(
      taskIdsToRestore,
      "restore",
      (taskId) => apiRestoreTask(taskId),
      (failedCount) => t("tasks.bulk.restorePartialFailure", { count: failedCount }),
    );
  }

  async function reorderTasks(orderedTaskIds: number[]) {
    const previousTasks = tasks;
    const positionByTaskId = new Map(orderedTaskIds.map((id, index) => [id, index]));

    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        const nextPosition = positionByTaskId.get(task.id);

        return nextPosition === undefined ? task : { ...task, position: nextPosition };
      }),
    );

    try {
      const nextTasks = await apiReorderTasks(orderedTaskIds);

      setTasks(nextTasks);
      setCompletionError(null);
    } catch (err) {
      setTasks(previousTasks);
      setCompletionError(err instanceof Error ? err.message : t("tasks.errors.reorderTasks"));
    }
  }

  async function confirmTaskDelete() {
    if (!deleteModal.deleteTarget) {
      return;
    }

    if (deleteModal.deleteTarget.mode === "bulk") {
      await runBulkTaskAction(
        deleteModal.deleteTarget.taskIds,
        "delete",
        (taskId) => deleteTask(taskId),
        (failedCount) => t("tasks.bulk.deletePartialFailure", { count: failedCount }),
      );

      deleteModal.closeDeleteTaskModal();
      return;
    }

    const taskId = deleteModal.deleteTarget.task.id;

    addPendingTaskIds([taskId]);
    deleteModal.setDeleteError(null);

    try {
      const deletedTask = await deleteTask(taskId);
      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === deletedTask.id ? deletedTask : task)),
      );
      deleteModal.closeDeleteTaskModal();
    } catch (err) {
      deleteModal.setDeleteError(err instanceof Error ? err.message : t("tasks.errors.deleteTask"));
    } finally {
      removePendingTaskIds([taskId]);
    }
  }

  return {
    completionError,
    shareFeedbackMessage,
    pendingTaskIds,
    bulkAction,
    dismissCompletionError: () => setCompletionError(null),
    dismissShareFeedback: () => setShareFeedbackMessage(null),
    onTaskSubmit,
    toggleTaskCompletion,
    toggleSubtaskCompletion,
    updateSelectedTasksCompletion,
    updateSelectedTasksPriority,
    shareTask,
    revokeTaskShare,
    restoreTask,
    restoreSelectedTasks,
    reorderTasks,
    confirmTaskDelete,
  };
}
