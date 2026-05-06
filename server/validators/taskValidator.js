const ALLOWED_PRIORITIES = new Set(["high", "medium", "low"]);
const ALLOWED_RECURRENCES = new Set(["none", "daily", "weekly", "monthly"]);
const DUE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function trimString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCreateTaskFields(payload) {
  const recurrenceRaw = trimString(payload?.recurrence);
  return {
    title: trimString(payload?.title),
    description: trimString(payload?.description),
    priority: payload?.priority,
    dueDate: trimString(payload?.dueDate),
    tag: trimString(payload?.tag),
    recurrence: recurrenceRaw.length > 0 ? recurrenceRaw : "none",
    recurrenceEndDate: trimString(payload?.recurrenceEndDate),
  };
}

function findCreateTaskError(fields) {
  const { title, priority, dueDate, recurrence, recurrenceEndDate } = fields;
  const today = new Date().toISOString().slice(0, 10);

  if (!title) return "Title is required";
  if (!ALLOWED_PRIORITIES.has(priority)) return "Priority must be high, medium, or low";
  if (dueDate && !DUE_DATE_PATTERN.test(dueDate)) return "Due date must use YYYY-MM-DD format";
  if (dueDate && dueDate < today) return "Due date cannot be in the past";
  if (!ALLOWED_RECURRENCES.has(recurrence)) return "Recurrence must be none, daily, weekly, or monthly";
  if (recurrence !== "none" && !dueDate) return "Recurring tasks require a due date";
  if (recurrenceEndDate && !DUE_DATE_PATTERN.test(recurrenceEndDate)) return "Recurrence end date must use YYYY-MM-DD format";
  if (recurrence === "none" && recurrenceEndDate) return "Recurrence end date requires a recurrence";
  if (recurrence !== "none" && recurrenceEndDate && dueDate && recurrenceEndDate < dueDate) {
    return "Recurrence end date cannot be before the due date";
  }
  return null;
}

function buildCreateTaskValue(fields) {
  const { title, description, priority, dueDate, tag, recurrence, recurrenceEndDate } = fields;
  return {
    title,
    description: description || null,
    priority,
    dueDate: dueDate || null,
    tag: tag || null,
    recurrence,
    recurrenceEndDate: recurrence === "none" ? null : recurrenceEndDate || null,
  };
}

function validateCreateTaskPayload(payload) {
  const fields = normalizeCreateTaskFields(payload);
  const error = findCreateTaskError(fields);
  if (error) return { error };
  return { value: buildCreateTaskValue(fields) };
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
