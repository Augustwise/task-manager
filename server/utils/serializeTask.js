function serializeTask(task) {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? "",
    priority: task.priority,
    dueDate: task.due_date ?? task.dueDate ?? "",
    createdAt: task.created_at ?? task.createdAt,
    tag: task.tag ?? "",
    completed: task.completed,
    shareToken: task.share_token ?? task.shareToken ?? null,
    recurrence: task.recurrence ?? "none",
    recurrenceEndDate: task.recurrence_end_date ?? task.recurrenceEndDate ?? "",
    subtasks: (task.subtasks ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      completed: s.completed,
    })),
  };
}

module.exports = { serializeTask };
