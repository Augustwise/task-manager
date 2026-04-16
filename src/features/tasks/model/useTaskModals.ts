import { useState } from "react";
import type { CreateTaskDto, TaskDto } from "../../../shared/types";
import type { DeleteTarget, TaskFormErrors } from "../types/model";
import { EMPTY_TASK_FORM } from "./taskForm";

function getTaskFormValues(task: TaskDto): CreateTaskDto {
  return {
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate,
    tag: task.tag,
    recurrence: task.recurrence ?? "none",
    recurrenceEndDate: task.recurrenceEndDate ?? "",
    subtasks: task.subtasks.map((subtask) => subtask.title),
  };
}

export function useTaskModals() {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [formValues, setFormValues] = useState<CreateTaskDto>(EMPTY_TASK_FORM);
  const [fieldErrors, setFieldErrors] = useState<TaskFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function resetTaskModalState() {
    setFormValues(EMPTY_TASK_FORM);
    setFieldErrors({});
    setFormError(null);
  }

  function openCreateTaskModal() {
    setEditingTaskId(null);
    resetTaskModalState();
    setIsTaskModalOpen(true);
  }

  function openEditTaskModal(task: TaskDto) {
    setEditingTaskId(task.id);
    setFormValues(getTaskFormValues(task));
    setFieldErrors({});
    setFormError(null);
    setIsTaskModalOpen(true);
  }

  function closeTaskModal() {
    setIsTaskModalOpen(false);
    setEditingTaskId(null);
    resetTaskModalState();
  }

  function onTaskFieldChange(field: keyof CreateTaskDto, value: string) {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));

    setFieldErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors;
      }

      return {
        ...currentErrors,
        [field]: undefined,
      };
    });

    setFormError(null);
  }

  function onSubtaskAdd(title: string) {
    setFormValues((currentValues) => ({
      ...currentValues,
      subtasks: [...(currentValues.subtasks ?? []), title],
    }));
  }

  function onSubtaskRemove(index: number) {
    setFormValues((currentValues) => ({
      ...currentValues,
      subtasks: (currentValues.subtasks ?? []).filter((_, currentIndex) => currentIndex !== index),
    }));
  }

  function openDeleteTaskModal(task: TaskDto) {
    setDeleteTarget({
      mode: "single",
      task,
    });
    setDeleteError(null);
  }

  function openBulkDeleteModal(taskIds: number[], taskTitle: string) {
    if (taskIds.length === 0) {
      return;
    }

    setDeleteTarget({
      mode: "bulk",
      taskCount: taskIds.length,
      taskIds,
      taskTitle,
    });
    setDeleteError(null);
  }

  function closeDeleteTaskModal() {
    setDeleteTarget(null);
    setDeleteError(null);
  }

  const mode: "create" | "edit" = editingTaskId === null ? "create" : "edit";

  return {
    taskModal: {
      isOpen: isTaskModalOpen,
      mode,
      editingTaskId,
      formValues,
      fieldErrors,
      formError,
      isSubmitting,
      setFieldErrors,
      setFormError,
      setIsSubmitting,
      openCreateTaskModal,
      openEditTaskModal,
      closeTaskModal,
      onFieldChange: onTaskFieldChange,
      onSubtaskAdd,
      onSubtaskRemove,
    },
    deleteModal: {
      deleteTarget,
      deleteError,
      setDeleteError,
      openDeleteTaskModal,
      openBulkDeleteModal,
      closeDeleteTaskModal,
    },
  };
}
