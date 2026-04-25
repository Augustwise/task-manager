/**
 * Seed script: creates one mock user with 15 tasks + subtasks.
 *
 * Current mock date baseline: 2026-04-25.
 * Run manually from the repository root:
 *   node server/seed-mock-data.js
 */

require("dotenv").config();
const bcrypt = require("bcrypt");
const sequelize = require("./db");
const User = require("./models/User");
const Task = require("./models/Task");
const Subtask = require("./models/Subtask");
const { runMigrations } = require("./migrations");

const MOCK_USER = {
  email: "mock.user.20262@example.com",
  password: "MockUser20262233ggs!",
};

const TASKS = [
  {
    title: "Triage incoming tasks after the weekend",
    description: "Review new requests, mark urgent items, and organize everything by priority.",
    priority: "high",
    due_date: "2026-04-21",
    tag: "Planning",
    completed: false,
    subtasks: [
      { title: "Review new requests", completed: true },
      { title: "Flag blockers", completed: false },
      { title: "Plan quick fixes", completed: false },
    ],
  },
  {
    title: "Pay service invoices for April",
    description: "Check invoices for hosting, the domain, and the email service.",
    priority: "high",
    due_date: "2026-04-22",
    tag: "Finance",
    completed: false,
    subtasks: [
      { title: "Verify invoice totals", completed: false },
      { title: "Pay the hosting bill", completed: false },
    ],
  },
  {
    title: "Close leftover tasks from the previous sprint",
    description: "Move relevant tasks into the new sprint and close the rest with comments.",
    priority: "medium",
    due_date: "2026-04-23",
    tag: "Team",
    completed: true,
    subtasks: [
      { title: "Review open cards", completed: true },
      { title: "Update statuses", completed: true },
    ],
  },
  {
    title: "Prepare demo notes",
    description: "Collect the list of changes, risks, and questions for the team.",
    priority: "medium",
    due_date: "2026-04-24",
    tag: "Docs",
    completed: false,
    subtasks: [
      { title: "List completed features", completed: true },
      { title: "Add discussion questions", completed: false },
    ],
  },
  {
    title: "Review the calendar layout",
    description: "Check the mobile grid, empty states, and the daily task display.",
    priority: "high",
    due_date: "2026-04-25",
    tag: "Design",
    completed: false,
    subtasks: [
      { title: "Check the desktop view", completed: false },
      { title: "Check the mobile view", completed: false },
      { title: "Collect notes for the designer", completed: false },
    ],
  },
  {
    title: "Write the weekly work plan",
    description: "Break large tasks into short steps and clarify deadlines.",
    priority: "medium",
    due_date: "2026-04-26",
    tag: "Planning",
    completed: false,
    subtasks: [
      { title: "Choose the main goals", completed: false },
      { title: "Estimate effort", completed: false },
    ],
  },
  {
    title: "Check the authentication API",
    description: "Go through registration, login, current user lookup, and logout.",
    priority: "high",
    due_date: "2026-04-27",
    tag: "Backend",
    completed: false,
    subtasks: [
      { title: "Check registration", completed: false },
      { title: "Check login", completed: false },
      { title: "Check logout", completed: false },
    ],
  },
  {
    title: "Update the project setup README",
    description: "Add environment variables and commands for the client and server.",
    priority: "low",
    due_date: "2026-04-28",
    tag: "Docs",
    completed: false,
    subtasks: [
      { title: "Document the .env file", completed: false },
      { title: "Add startup commands", completed: false },
    ],
  },
  {
    title: "Set up database backups",
    description: "Agree on the backup schedule and where dumps should be stored.",
    priority: "medium",
    due_date: "2026-04-29",
    tag: "Operations",
    completed: false,
    subtasks: [
      { title: "Choose the schedule", completed: false },
      { title: "Check storage access", completed: false },
    ],
  },
  {
    title: "Collect feedback from testers",
    description: "Ask QA to run through the new scenarios and document their notes.",
    priority: "medium",
    due_date: "2026-04-30",
    tag: "QA",
    completed: false,
    subtasks: [
      { title: "Send the scenario list", completed: false },
      { title: "Collect discovered bugs", completed: false },
    ],
  },
  {
    title: "Clean up the deleted task archive",
    description: "Check that restore works correctly and remove obsolete records.",
    priority: "low",
    due_date: "2026-05-02",
    tag: "Operations",
    completed: false,
    subtasks: [],
  },
  {
    title: "Prepare release notes",
    description: "Briefly describe new features, fixes, and known limitations.",
    priority: "medium",
    due_date: "2026-05-04",
    tag: "Docs",
    completed: false,
    subtasks: [
      { title: "List new features", completed: false },
      { title: "List fixed bugs", completed: false },
    ],
  },
  {
    title: "Run the team retrospective",
    description: "Collect topics, run the meeting, and save the action items.",
    priority: "medium",
    due_date: "2026-05-06",
    tag: "Team",
    completed: false,
    subtasks: [
      { title: "Prepare the board", completed: true },
      { title: "Run the meeting", completed: false },
      { title: "Write down action items", completed: false },
    ],
  },
  {
    title: "Start the weekly task report",
    description: "Check a recurring task for the weekly recurrence demo.",
    priority: "low",
    due_date: "2026-05-08",
    tag: "Reports",
    completed: false,
    recurrence: "weekly",
    recurrence_end_date: "2026-06-26",
    subtasks: [
      { title: "Collect metrics", completed: false },
      { title: "Send the report to the team", completed: false },
    ],
  },
  {
    title: "Plan the May roadmap",
    description: "Collect ideas, assess risks, and choose tasks for the next month.",
    priority: "high",
    due_date: "2026-05-12",
    tag: "Roadmap",
    completed: false,
    subtasks: [
      { title: "Collect proposals", completed: false },
      { title: "Evaluate priorities", completed: false },
      { title: "Approve the plan", completed: false },
    ],
  },
];

async function seed() {
  let transaction;

  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await runMigrations(sequelize);

    transaction = await sequelize.transaction();

    const existing = await User.findOne({
      where: { email: MOCK_USER.email },
      transaction,
    });

    if (existing) {
      console.log(`User ${MOCK_USER.email} already exists (id=${existing.id}). Aborting.`);
      await transaction.rollback();
      transaction = null;
      return;
    }

    const passwordHash = await bcrypt.hash(MOCK_USER.password, 10);
    const user = await User.create(
      {
        email: MOCK_USER.email,
        password_hash: passwordHash,
      },
      { transaction }
    );

    for (const [index, taskData] of TASKS.entries()) {
      const { subtasks: subtaskList, ...taskFields } = taskData;
      const task = await Task.create(
        {
          recurrence: "none",
          recurrence_end_date: null,
          ...taskFields,
          position: index,
          user_id: user.id,
        },
        { transaction }
      );

      if (subtaskList.length > 0) {
        await Subtask.bulkCreate(
          subtaskList.map((subtask) => ({ ...subtask, task_id: task.id })),
          { transaction }
        );
      }

      console.log(`  + ${task.title} (${subtaskList.length} subtasks)`);
    }

    await transaction.commit();
    transaction = null;

    console.log(`\nDone! Created ${TASKS.length} tasks for ${MOCK_USER.email}`);
    console.log(`Login: ${MOCK_USER.email} / ${MOCK_USER.password}`);
  } catch (err) {
    if (transaction) {
      await transaction.rollback();
    }

    console.error("Seed failed:", err);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seed();
