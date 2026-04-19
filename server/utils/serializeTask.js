function serializeTask(task) {
  const deletedAt = task.deleted_at ?? task.deletedAt ?? "";
  const restoreAvailableUntil = deletedAt
    ? new Date(new Date(deletedAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
    : "";

  return {
    id: task.id,
    title: task.title,
    description: task.description ?? "",
    priority: task.priority,
    dueDate: task.due_date ?? task.dueDate ?? "",
    createdAt: task.created_at ?? task.createdAt,
    tag: task.tag ?? "",
    completed: task.completed,
    deletedAt,
    restoreAvailableUntil,
    shareToken: task.share_token ?? task.shareToken ?? null,
    recurrence: task.recurrence ?? "none",
    recurrenceEndDate: task.recurrence_end_date ?? task.recurrenceEndDate ?? "",
    position: task.position ?? 0,
    subtasks: (task.subtasks ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      completed: s.completed,
    })),
  };
}

module.exports = { serializeTask };
