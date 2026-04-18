const Task = require("../models/Task");
const Subtask = require("../models/Subtask");
const { getNextOccurrence } = require("../utils/recurrence");
const { Op } = require("sequelize");

const ARCHIVE_RETENTION_DAYS = 7;
const ARCHIVE_RETENTION_MS = ARCHIVE_RETENTION_DAYS * 24 * 60 * 60 * 1000; // 7 days

function getArchiveCutoff() {
  return new Date(Date.now() - ARCHIVE_RETENTION_MS);
}

function getActiveTaskWhereClause(userId) {
  return {
    user_id: userId,
    deleted_at: null,
  };
}

async function purgeExpiredDeletedTasks(userId) {
  const where = {
    deleted_at: {
      [Op.lt]: getArchiveCutoff(),
    },
  };

  if (userId !== undefined) {
    where.user_id = userId;
  }

  await Task.destroy({ where });
}

async function findTasksByUserId(userId) {
  await purgeExpiredDeletedTasks(userId);

  return Task.findAll({
    where: { user_id: userId },
    include: [{ model: Subtask, as: "subtasks" }],
    order: [
      ["deleted_at", "DESC"],
      ["completed", "ASC"],
      ["due_date", "ASC"],
      ["id", "ASC"],
    ],
  });
}

async function createTask({
  userId,
  title,
  description,
  priority,
  dueDate,
  tag,
  recurrence = "none",
  recurrenceEndDate = null,
  subtasks = [],
}) {
  const task = await Task.create({
    user_id: userId,
    title,
    description,
    priority,
    due_date: dueDate,
    tag,
    recurrence,
    recurrence_end_date: recurrenceEndDate,
  });

  if (subtasks.length > 0) {
    await Subtask.bulkCreate(
      subtasks.map((subtaskTitle) => ({ task_id: task.id, title: subtaskTitle })),
    );
  }

  return findTaskByIdForUser(task.id, userId);
}

async function updateTask(
  task,
  { title, description, priority, dueDate, tag, recurrence, recurrenceEndDate, subtasks },
) {
  task.title = title;
  task.description = description;
  task.priority = priority;
  task.due_date = dueDate;
  task.tag = tag;
  if (recurrence !== undefined) {
    task.recurrence = recurrence;
  }
  if (recurrenceEndDate !== undefined) {
    task.recurrence_end_date = recurrenceEndDate;
  }
  await task.save();

  if (subtasks !== undefined) {
    const incomingIds = subtasks.filter((s) => s.id != null).map((s) => s.id);

    await Subtask.destroy({
      where: {
        task_id: task.id,
        ...(incomingIds.length > 0 ? { id: { [Op.notIn]: incomingIds } } : {}),
      },
    });

    for (const subtask of subtasks) {
      if (subtask.id == null) {
        await Subtask.create({ task_id: task.id, title: subtask.title });
      } else {
        await Subtask.update({ title: subtask.title }, { where: { id: subtask.id, task_id: task.id } });
      }
    }

    if (subtasks.length === 0) {
      await Subtask.destroy({ where: { task_id: task.id } });
    }
  }

  return findTaskByIdForUser(task.id, task.user_id);
}

function findTaskByIdForUser(taskId, userId) {
  return findTaskByIdForUserWithOptions(taskId, userId);
}

async function findTaskByIdForUserWithOptions(taskId, userId, { includeDeleted = true } = {}) {
  await purgeExpiredDeletedTasks(userId);

  return Task.findOne({
    where: {
      id: taskId,
      ...(includeDeleted ? { user_id: userId } : getActiveTaskWhereClause(userId)),
    },
    include: [{ model: Subtask, as: "subtasks" }],
  });
}

async function findTaskByShareToken(shareToken) {
  await purgeExpiredDeletedTasks();

  return Task.findOne({
    where: {
      share_token: shareToken,
      deleted_at: null,
    },
    include: [{ model: Subtask, as: "subtasks" }],
  });
}

function findTaskByShareTokenForOtherTask(shareToken, taskId) {
  return Task.findOne({
    where: {
      share_token: shareToken,
      id: { [Op.ne]: taskId },
      deleted_at: null,
    },
  });
}

async function updateTaskCompletion(task, completed) {
  const recurrence = task.recurrence ?? "none";
  const endDate = task.recurrence_end_date;
  const dueDate = task.due_date;

  if (completed && recurrence !== "none" && dueDate) {
    const nextDueDate = getNextOccurrence(dueDate, recurrence);

    if (nextDueDate && (!endDate || nextDueDate <= endDate)) {
      task.due_date = nextDueDate;
      task.completed = false;

      if (task.subtasks && task.subtasks.length > 0) {
        await Subtask.update(
          { completed: false },
          { where: { task_id: task.id } },
        );
      }

      await task.save();
      return findTaskByIdForUser(task.id, task.user_id);
    }
  }

  task.completed = completed;
  await task.save();
  return findTaskByIdForUser(task.id, task.user_id);
}

async function setTaskShareToken(task, shareToken) {
  task.share_token = shareToken;
  await task.save();
  return findTaskByIdForUser(task.id, task.user_id);
}

async function deleteTask(task) {
  task.deleted_at = new Date();
  await task.save();
  return findTaskByIdForUser(task.id, task.user_id);
}

async function restoreTask(task) {
  task.deleted_at = null;
  await task.save();
  return findTaskByIdForUser(task.id, task.user_id);
}

module.exports = {
  createTask,
  deleteTask,
  findTaskByIdForUser,
  findTaskByIdForUserWithOptions,
  findTaskByShareToken,
  findTaskByShareTokenForOtherTask,
  findTasksByUserId,
  restoreTask,
  setTaskShareToken,
  updateTask,
  updateTaskCompletion,
};
