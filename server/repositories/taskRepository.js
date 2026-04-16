const Task = require("../models/Task");
const Subtask = require("../models/Subtask");
const { getNextOccurrence } = require("../utils/recurrence");

function findTasksByUserId(userId) {
  return Task.findAll({
    where: { user_id: userId },
    include: [{ model: Subtask, as: "subtasks" }],
    order: [
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
        ...(incomingIds.length > 0 ? { id: { [require("sequelize").Op.notIn]: incomingIds } } : {}),
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
  return Task.findOne({
    where: {
      id: taskId,
      user_id: userId,
    },
    include: [{ model: Subtask, as: "subtasks" }],
  });
}

function findTaskByShareToken(shareToken) {
  return Task.findOne({
    where: { share_token: shareToken },
    include: [{ model: Subtask, as: "subtasks" }],
  });
}

function findTaskByShareTokenForOtherTask(shareToken, taskId) {
  return Task.findOne({
    where: {
      share_token: shareToken,
      id: { [require("sequelize").Op.ne]: taskId },
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
  await task.destroy();
}

module.exports = {
  createTask,
  deleteTask,
  findTaskByIdForUser,
  findTaskByShareToken,
  findTaskByShareTokenForOtherTask,
  findTasksByUserId,
  setTaskShareToken,
  updateTask,
  updateTaskCompletion,
};
