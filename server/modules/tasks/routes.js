const crypto = require("node:crypto");
const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  createTask,
  deleteTask,
  findTaskByIdForUser,
  findTaskByShareToken,
  findTaskByShareTokenForOtherTask,
  findTasksByUserId,
  setTaskShareToken,
  updateTask,
  updateTaskCompletion,
} = require("../../repositories/taskRepository");
const { findSubtaskByIdForTask, updateSubtaskCompletion } = require("../../repositories/subtaskRepository");
const { requireAuth } = require("../../middleware/requireAuth");
const { serializeTask } = require("../../utils/serializeTask");
const { AUTH_MESSAGES } = require("../../validators/authValidator");
const {
  validateCreateTaskPayload,
  validateTaskCompletionPayload,
} = require("../../validators/taskValidator");

const router = express.Router();
const taskCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 400,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Request limit reached. Please try again later.",
  },
});

async function generateUniqueShareToken(taskId) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const token = crypto.randomBytes(24).toString("hex");
    const existingTask = await findTaskByShareTokenForOtherTask(token, taskId);

    if (!existingTask) {
      return token;
    }
  }

  throw new Error("Failed to generate a unique share token");
}

router.get("/public/tasks/:shareToken", async (req, res) => {
  try {
    const shareToken = typeof req.params.shareToken === "string" ? req.params.shareToken.trim() : "";

    if (!/^[a-f0-9]{48}$/i.test(shareToken)) {
      return res.status(404).json({ error: "Shared task not found" });
    }

    const task = await findTaskByShareToken(shareToken);
    if (!task) {
      return res.status(404).json({ error: "Shared task not found" });
    }

    return res.json({ task: serializeTask(task) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: AUTH_MESSAGES.serverError });
  }
});

router.use(requireAuth);

router.get("/tasks", async (req, res) => {
  try {
    const tasks = await findTasksByUserId(req.user.id);

    return res.json({ tasks: tasks.map(serializeTask) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: AUTH_MESSAGES.serverError });
  }
});

router.post("/tasks", taskCreationLimiter, async (req, res) => {
  try {
    const result = validateCreateTaskPayload(req.body);

    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    const subtasks = Array.isArray(req.body.subtasks)
      ? req.body.subtasks.filter((t) => typeof t === "string" && t.trim().length > 0).map((t) => t.trim())
      : [];

    const task = await createTask({
      userId: req.user.id,
      title: result.value.title,
      description: result.value.description,
      priority: result.value.priority,
      dueDate: result.value.dueDate,
      tag: result.value.tag,
      recurrence: result.value.recurrence,
      recurrenceEndDate: result.value.recurrenceEndDate,
      subtasks,
    });

    return res.status(201).json({ task: serializeTask(task) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: AUTH_MESSAGES.serverError });
  }
});

router.post("/tasks/:taskId/share", async (req, res) => {
  try {
    const taskId = Number.parseInt(req.params.taskId, 10);
    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({ error: "Task id must be a positive integer" });
    }

    const task = await findTaskByIdForUser(taskId, req.user.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const shareToken = await generateUniqueShareToken(task.id);
    const updatedTask = await setTaskShareToken(task, shareToken);

    return res.json({ task: serializeTask(updatedTask) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: AUTH_MESSAGES.serverError });
  }
});

router.delete("/tasks/:taskId/share", async (req, res) => {
  try {
    const taskId = Number.parseInt(req.params.taskId, 10);
    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({ error: "Task id must be a positive integer" });
    }

    const task = await findTaskByIdForUser(taskId, req.user.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updatedTask = await setTaskShareToken(task, null);

    return res.json({ task: serializeTask(updatedTask) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: AUTH_MESSAGES.serverError });
  }
});

router.put("/tasks/:taskId", async (req, res) => {
  try {
    const taskId = Number.parseInt(req.params.taskId, 10);
    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({ error: "Task id must be a positive integer" });
    }

    const result = validateCreateTaskPayload(req.body);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    const task = await findTaskByIdForUser(taskId, req.user.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const subtasks = Array.isArray(req.body.subtasks)
      ? req.body.subtasks
          .filter((s) => s && typeof s.title === "string" && s.title.trim().length > 0)
          .map((s) => ({ id: s.id ?? undefined, title: s.title.trim() }))
      : undefined;

    const updatedTask = await updateTask(task, { ...result.value, subtasks });

    return res.json({ task: serializeTask(updatedTask) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: AUTH_MESSAGES.serverError });
  }
});

router.patch("/tasks/:taskId", async (req, res) => {
  try {
    const taskId = Number.parseInt(req.params.taskId, 10);
    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({ error: "Task id must be a positive integer" });
    }

    const result = validateTaskCompletionPayload(req.body);
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }

    const task = await findTaskByIdForUser(taskId, req.user.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const updatedTask = await updateTaskCompletion(task, result.value.completed);

    return res.json({ task: serializeTask(updatedTask) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: AUTH_MESSAGES.serverError });
  }
});

router.patch("/tasks/:taskId/subtasks/:subtaskId", async (req, res) => {
  try {
    const taskId = Number.parseInt(req.params.taskId, 10);
    const subtaskId = Number.parseInt(req.params.subtaskId, 10);

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({ error: "Task id must be a positive integer" });
    }
    if (!Number.isInteger(subtaskId) || subtaskId <= 0) {
      return res.status(400).json({ error: "Subtask id must be a positive integer" });
    }
    if (typeof req.body.completed !== "boolean") {
      return res.status(400).json({ error: "completed must be a boolean" });
    }

    const task = await findTaskByIdForUser(taskId, req.user.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const subtask = await findSubtaskByIdForTask(subtaskId, taskId);
    if (!subtask) {
      return res.status(404).json({ error: "Subtask not found" });
    }

    await updateSubtaskCompletion(subtask, req.body.completed);

    const refreshedTask = await findTaskByIdForUser(taskId, req.user.id);
    const allDone = refreshedTask.subtasks.length > 0 && refreshedTask.subtasks.every((s) => s.completed);
    const anyIncomplete = refreshedTask.subtasks.some((s) => !s.completed);

    if (allDone && !refreshedTask.completed) {
      await updateTaskCompletion(refreshedTask, true);
    } else if (anyIncomplete && refreshedTask.completed) {
      await updateTaskCompletion(refreshedTask, false);
    }

    const finalTask = await findTaskByIdForUser(taskId, req.user.id);

    return res.json({ task: serializeTask(finalTask) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: AUTH_MESSAGES.serverError });
  }
});

router.delete("/tasks/:taskId", async (req, res) => {
  try {
    const taskId = Number.parseInt(req.params.taskId, 10);
    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({ error: "Task id must be a positive integer" });
    }

    const task = await findTaskByIdForUser(taskId, req.user.id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    await deleteTask(task);

    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: AUTH_MESSAGES.serverError });
  }
});

module.exports = router;
