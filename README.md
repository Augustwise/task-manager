# Task Manager

Task Manager is a web app for keeping track of personal tasks, deadlines, and progress in one place.

It is designed to help people:

- create and organize tasks
- break big tasks into smaller subtasks
- keep an eye on upcoming due dates
- mark work as done and track progress
- share a task with someone else using a public link

## Keyboard Shortcuts

On the tasks page:

- press `n` to open the new task modal
- press `/` to focus the search field when it is visible

## What You Can Do

With Task Manager, you can:

- sign up and log in to your own account
- add tasks with a title, description, priority, due date, and tag
- edit or delete tasks later
- split tasks into subtasks
- view tasks in a list or on a calendar
- search, filter, and sort your tasks
- see separate sections for active and completed work
- generate a share link for a task and remove it when you no longer want to share it

## Running the Project

If you want to run the app on your computer, you will need:

- Node.js
- npm
- PostgreSQL

### 1. Install dependencies

From the project root:

```bash
npm install
```

From the `server` folder:

```bash
npm install
```

### 2. Create a `.env` file

Copy `.env.example` in the project root to `.env` and adjust values for your environment.
The backend reads the PostgreSQL connection from `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, and `DB_SSL`.

### 3. Start the backend

From the `server` folder:

```bash
npm run dev
```

### 4. Start the frontend

From the project root:

```bash
npm run dev
```

After that, open `http://localhost:5173` in your browser.

## Project Layout

The repository is split into a few main parts:

| Path | Description |
|------|-------------|
| `./` | Frontend app |
| `./server` | Backend and database connection logic |
| `./shared` | Settings shared by both sides of the project |

## Helpful Notes

- The backend reads environment settings from the root `.env` file, including the individual PostgreSQL connection variables (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL`).
- The frontend talks to the backend through `/api` requests during local development.
- Shared task links are view-only.

## Scripts

From the project root:

- `npm run dev` starts the frontend
- `npm run build` builds the frontend
- `npm run lint` checks the frontend code style

From `server/`:

- `npm run dev` starts the backend in development mode
- `npm start` starts the backend normally
