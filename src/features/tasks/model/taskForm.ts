import type { CreateTaskDto } from "../../../shared/types";
import { t } from "../../../shared/i18n";
import type { TaskFormErrors } from "../types/model";

export const EMPTY_TASK_FORM: CreateTaskDto = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
  tag: "",
  recurrence: "none",
  recurrenceEndDate: "",
  subtasks: [],
};

function todayAsDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export function normalizeTaskFormValues(values: CreateTaskDto): CreateTaskDto {
  const recurrence = values.recurrence ?? "none";

  return {
    title: values.title.trim(),
    description: values.description.trim(),
    priority: values.priority,
    dueDate: values.dueDate,
    tag: values.tag.trim(),
    recurrence,
    recurrenceEndDate: recurrence === "none" ? "" : values.recurrenceEndDate,
    subtasks: (values.subtasks ?? []).map((s) => s.trim()).filter(Boolean),
  };
}

export function validateTaskForm(values: CreateTaskDto): TaskFormErrors {
  const errors: TaskFormErrors = {};
  const today = todayAsDateInputValue();

  if (!values.title) {
    errors.title = t("validation.titleRequired");
  }

  if (!values.priority) {
    errors.priority = t("validation.priorityRequired");
  }

  if (values.dueDate && values.dueDate < today) {
    errors.dueDate = t("validation.dueDatePast");
  }

  const isRecurring = values.recurrence !== "none";
  const hasRecurrenceEnd = isRecurring && Boolean(values.recurrenceEndDate);
  const recurrenceEndIsBeforeDueDate =
    hasRecurrenceEnd &&
    Boolean(values.dueDate) &&
    values.recurrenceEndDate < values.dueDate;

  if (isRecurring && !values.dueDate) {
    errors.recurrence = t("validation.recurrenceRequiresDueDate");
  }

  if (recurrenceEndIsBeforeDueDate) {
    errors.recurrenceEndDate = t("validation.recurrenceEndBeforeDueDate");
  }

  return errors;
}
