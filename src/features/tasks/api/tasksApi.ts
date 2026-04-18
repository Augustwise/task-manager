import { apiRequest } from "../../../shared/api/apiClient";
import { t } from "../../../shared/i18n";
import type {
  CreateTaskDto,
  TaskDto,
  UpdateTaskDto,
  UpdateTaskCompletionDto,
  UpdateSubtaskCompletionDto,
} from "../../../shared/types";
import type { TaskResponse, TasksResponse } from "../types/api";

export async function getTasks(): Promise<TaskDto[]> {
  const data = await apiRequest<TasksResponse>("/api/tasks", {
    fallbackErrorMessage: t("tasks.errors.loadTasks"),
  });

  return data.tasks;
}

export async function getPublicTask(shareToken: string): Promise<TaskDto> {
  const data = await apiRequest<TaskResponse>(`/api/public/tasks/${shareToken}`, {
    fallbackErrorMessage: t("tasks.errors.loadSharedTask"),
    handleUnauthorized: false,
  });

  return data.task;
}

export async function createTask(payload: CreateTaskDto): Promise<TaskDto> {
  const data = await apiRequest<TaskResponse>("/api/tasks", {
    method: "POST",
    body: payload,
    fallbackErrorMessage: t("tasks.errors.createTask"),
  });

  return data.task;
}

export async function createShareLink(taskId: number): Promise<TaskDto> {
  const data = await apiRequest<TaskResponse>(`/api/tasks/${taskId}/share`, {
    method: "POST",
    fallbackErrorMessage: t("tasks.errors.createShareLink"),
  });

  return data.task;
}

export async function revokeShareLink(taskId: number): Promise<TaskDto> {
  const data = await apiRequest<TaskResponse>(`/api/tasks/${taskId}/share`, {
    method: "DELETE",
    fallbackErrorMessage: t("tasks.errors.revokeShareLink"),
  });

  return data.task;
}

export async function updateTask(taskId: number, payload: UpdateTaskDto): Promise<TaskDto> {
  const data = await apiRequest<TaskResponse>(`/api/tasks/${taskId}`, {
    method: "PUT",
    body: payload,
    fallbackErrorMessage: t("tasks.errors.updateTask"),
  });

  return data.task;
}

export async function updateTaskCompletion(
  taskId: number,
  payload: UpdateTaskCompletionDto,
): Promise<TaskDto> {
  const data = await apiRequest<TaskResponse>(`/api/tasks/${taskId}`, {
    method: "PATCH",
    body: payload,
    fallbackErrorMessage: t("tasks.errors.updateTask"),
  });

  return data.task;
}

export async function toggleSubtaskCompletion(
  taskId: number,
  subtaskId: number,
  payload: UpdateSubtaskCompletionDto,
): Promise<TaskDto> {
  const data = await apiRequest<TaskResponse>(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
    method: "PATCH",
    body: payload,
    fallbackErrorMessage: t("tasks.errors.updateSubtask"),
  });

  return data.task;
}

export async function deleteTask(taskId: number): Promise<TaskDto> {
  const data = await apiRequest<TaskResponse>(`/api/tasks/${taskId}`, {
    method: "DELETE",
    fallbackErrorMessage: t("tasks.errors.deleteTask"),
  });

  return data.task;
}

export async function restoreTask(taskId: number): Promise<TaskDto> {
  const data = await apiRequest<TaskResponse>(`/api/tasks/${taskId}/restore`, {
    method: "PATCH",
    fallbackErrorMessage: t("tasks.errors.restoreTask"),
  });

  return data.task;
}
