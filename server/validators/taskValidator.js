const ALLOWED_PRIORITIES = new Set(["high", "medium", "low"]);
const ALLOWED_RECURRENCES = new Set(["none", "daily", "weekly", "monthly"]);
const DUE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function validateCreateTaskPayload(payload) {
  const title = typeof payload?.title === "string" ? payload.title.trim() : "";
  const description =
    typeof payload?.description === "string" ? payload.description.trim() : "";
  const priority = payload?.priority;
  const dueDate = typeof payload?.dueDate === "string" ? payload.dueDate.trim() : "";
  const tag = typeof payload?.tag === "string" ? payload.tag.trim() : "";
  const recurrence =
    typeof payload?.recurrence === "string" && payload.recurrence.trim().length > 0
      ? payload.recurrence.trim()
      : "none";
  const recurrenceEndDate =
    typeof payload?.recurrenceEndDate === "string" ? payload.recurrenceEndDate.trim() : "";
  const today = new Date().toISOString().slice(0, 10);

  if (!title) {
    return { error: "Title is required" };
  }

  if (!ALLOWED_PRIORITIES.has(priority)) {
    return { error: "Priority must be high, medium, or low" };
  }

  if (dueDate && !DUE_DATE_PATTERN.test(dueDate)) {
    return { error: "Due date must use YYYY-MM-DD format" };
  }

  if (dueDate && dueDate < today) {
    return { error: "Due date cannot be in the past" };
  }

  if (!ALLOWED_RECURRENCES.has(recurrence)) {
    return { error: "Recurrence must be none, daily, weekly, or monthly" };
  }

  if (recurrence !== "none" && !dueDate) {
    return { error: "Recurring tasks require a due date" };
  }

  if (recurrenceEndDate && !DUE_DATE_PATTERN.test(recurrenceEndDate)) {
    return { error: "Recurrence end date must use YYYY-MM-DD format" };
  }

  if (recurrence === "none" && recurrenceEndDate) {
    return { error: "Recurrence end date requires a recurrence" };
  }

  if (recurrence !== "none" && recurrenceEndDate && dueDate && recurrenceEndDate < dueDate) {
    return { error: "Recurrence end date cannot be before the due date" };
  }

  return {
    value: {
      title,
      description: description || null,
      priority,
      dueDate: dueDate || null,
      tag: tag || null,
      recurrence,
      recurrenceEndDate: recurrence === "none" ? null : recurrenceEndDate || null,
    },
  };
}

function validateTaskCompletionPayload(payload) {
  if (typeof payload?.completed !== "boolean") {
    return { error: "Completed must be a boolean" };
  }

  return {
    value: {
      completed: payload.completed,
    },
  };
}

function validateReorderPayload(payload) {
  if (!payload || !Array.isArray(payload.taskIds)) {
    return { error: "taskIds must be an array" };
  }

  const taskIds = [];
  const seen = new Set();

  for (const rawId of payload.taskIds) {
    const id = typeof rawId === "number" ? rawId : Number.parseInt(rawId, 10);

    if (!Number.isInteger(id) || id <= 0) {
      return { error: "taskIds must contain positive integers" };
    }

    if (seen.has(id)) {
      return { error: "taskIds must not contain duplicates" };
    }

    seen.add(id);
    taskIds.push(id);
  }

  return { value: { taskIds } };
}

module.exports = {
  validateCreateTaskPayload,
  validateReorderPayload,
  validateTaskCompletionPayload,
};
