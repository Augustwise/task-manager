/**
 * Seed script: creates a test user with 20 tasks + subtasks.
 * Run: node server/seed-mock-data.js
 */

require("dotenv").config();
const bcrypt = require("bcrypt");
const sequelize = require("./db");
const User = require("./models/User");
const Task = require("./models/Task");
const Subtask = require("./models/Subtask");

const TEST_USER = {
  email: "testuser@example.com",
  password: "Test1234!43r4edew3++3c",
};

const TASKS = [
  {
    title: "Подготовить презентацию для клиента",
    description: "Собрать ключевые метрики за Q1, оформить слайды и согласовать с командой перед отправкой.",
    priority: "high",
    due_date: "2026-04-15",
    tag: "Planning",
    completed: false,
    subtasks: [
      { title: "Собрать данные по метрикам", completed: true },
      { title: "Сделать черновик слайдов", completed: false },
      { title: "Ревью от тимлида", completed: false },
    ],
  },
  {
    title: "Исправить баг с фильтрацией задач",
    description: "При выборе тега 'Operations' список не обновляется до перезагрузки страницы.",
    priority: "high",
    due_date: "2026-04-16",
    tag: "Frontend",
    completed: false,
    subtasks: [
      { title: "Воспроизвести баг", completed: true },
      { title: "Найти причину в коде", completed: false },
      { title: "Написать фикс и протестировать", completed: false },
    ],
  },
  {
    title: "Обновить зависимости проекта",
    description: "Проверить npm audit, обновить пакеты с критическими уязвимостями.",
    priority: "medium",
    due_date: "2026-04-17",
    tag: "Operations",
    completed: false,
    subtasks: [
      { title: "Запустить npm audit", completed: false },
      { title: "Обновить критичные пакеты", completed: false },
    ],
  },
  {
    title: "Написать юнит-тесты для авторизации",
    description: "Покрыть тестами регистрацию, логин и валидацию сессий.",
    priority: "high",
    due_date: "2026-04-18",
    tag: "QA",
    completed: false,
    subtasks: [
      { title: "Тест регистрации", completed: false },
      { title: "Тест логина", completed: false },
      { title: "Тест невалидного токена", completed: false },
    ],
  },
  {
    title: "Созвон с дизайнером по новому layout",
    description: "",
    priority: "medium",
    due_date: "2026-04-15",
    tag: "Team",
    completed: false,
    subtasks: [],
  },
  {
    title: "Настроить CI/CD пайплайн",
    description: "Добавить автоматический запуск тестов и деплой на staging при пуше в develop.",
    priority: "high",
    due_date: "2026-04-20",
    tag: "Operations",
    completed: false,
    subtasks: [
      { title: "Написать GitHub Actions workflow", completed: false },
      { title: "Настроить staging сервер", completed: false },
      { title: "Проверить деплой", completed: false },
    ],
  },
  {
    title: "Ревью pull request #42",
    description: "Проверить рефакторинг компонента TaskList — коллега переписал на хуки.",
    priority: "medium",
    due_date: "2026-04-16",
    tag: "Frontend",
    completed: false,
    subtasks: [
      { title: "Прочитать описание PR", completed: true },
      { title: "Проверить код", completed: false },
      { title: "Оставить комментарии", completed: false },
    ],
  },
  {
    title: "Оплатить счёт за хостинг",
    description: "Счёт от провайдера за апрель, дедлайн — 19 число.",
    priority: "high",
    due_date: "2026-04-19",
    tag: "Finance",
    completed: false,
    subtasks: [],
  },
  {
    title: "Подготовить отчёт по спринту",
    description: "Собрать статистику закрытых задач и velocity за последние две недели.",
    priority: "medium",
    due_date: "2026-04-21",
    tag: "Planning",
    completed: false,
    subtasks: [
      { title: "Экспорт данных из трекера", completed: false },
      { title: "Посчитать velocity", completed: false },
      { title: "Оформить отчёт", completed: false },
    ],
  },
  {
    title: "Обновить документацию API",
    description: "Добавить описание новых эндпоинтов для подзадач и шаринга задач.",
    priority: "low",
    due_date: "2026-04-23",
    tag: "Docs",
    completed: false,
    subtasks: [
      { title: "Задокументировать /subtasks", completed: false },
      { title: "Задокументировать /share", completed: false },
    ],
  },
  {
    title: "Миграция на новый почтовый сервис",
    description: "Перевести отправку уведомлений с SendGrid на Resend.",
    priority: "low",
    due_date: "2026-04-28",
    tag: "Operations",
    completed: false,
    subtasks: [
      { title: "Зарегистрировать аккаунт Resend", completed: true },
      { title: "Обновить код отправки", completed: false },
      { title: "Протестировать на staging", completed: false },
    ],
  },
  {
    title: "Провести 1-on-1 с джуном",
    description: "Обсудить прогресс за месяц, дать фидбек, обновить план развития.",
    priority: "medium",
    due_date: "2026-04-22",
    tag: "People",
    completed: false,
    subtasks: [
      { title: "Подготовить заметки", completed: false },
      { title: "Провести встречу", completed: false },
    ],
  },
  {
    title: "Купить лицензию на Figma",
    description: "",
    priority: "low",
    due_date: "2026-04-25",
    tag: "Finance",
    completed: false,
    subtasks: [],
  },
  {
    title: "Разобрать техдолг в модуле уведомлений",
    description: "Вынести хардкод, убрать дублирование, добавить логирование ошибок.",
    priority: "medium",
    due_date: "2026-04-24",
    tag: "Frontend",
    completed: false,
    subtasks: [
      { title: "Убрать захардкоженные строки", completed: false },
      { title: "Вынести общую логику в утилиты", completed: false },
      { title: "Добавить error logging", completed: false },
    ],
  },
  {
    title: "Ответить на тикеты в саппорте",
    description: "Три тикета висят больше суток — нужно разобраться или эскалировать.",
    priority: "high",
    due_date: "2026-04-15",
    tag: "Support",
    completed: false,
    subtasks: [
      { title: "Тикет #301 — проблема с экспортом", completed: false },
      { title: "Тикет #305 — не приходят письма", completed: false },
      { title: "Тикет #309 — ошибка 500 при удалении", completed: false },
    ],
  },
  {
    title: "Настроить мониторинг ошибок",
    description: "Подключить Sentry к production-серверу и настроить алерты в Slack.",
    priority: "medium",
    due_date: "2026-04-26",
    tag: "Operations",
    completed: false,
    subtasks: [
      { title: "Установить Sentry SDK", completed: false },
      { title: "Настроить Slack-интеграцию", completed: false },
    ],
  },
  {
    title: "Закрыть задачи из прошлого спринта",
    description: "Пройтись по незакрытым задачам, перенести актуальные в текущий спринт, остальные закрыть.",
    priority: "low",
    due_date: "2026-04-17",
    tag: "Planning",
    completed: true,
    subtasks: [
      { title: "Ревью открытых задач", completed: true },
      { title: "Перенести актуальные", completed: true },
      { title: "Закрыть неактуальные", completed: true },
    ],
  },
  {
    title: "Добавить тёмную тему",
    description: "Реализовать переключатель light/dark и сохранять выбор пользователя в localStorage.",
    priority: "low",
    due_date: "2026-05-05",
    tag: "Frontend",
    completed: false,
    subtasks: [
      { title: "Подготовить CSS-переменные", completed: false },
      { title: "Добавить toggle в UI", completed: false },
      { title: "Сохранение в localStorage", completed: false },
    ],
  },
  {
    title: "Провести ретроспективу спринта",
    description: "Собрать команду, обсудить что пошло хорошо / плохо, зафиксировать action items.",
    priority: "medium",
    due_date: "2026-04-18",
    tag: "Team",
    completed: false,
    subtasks: [
      { title: "Создать Miro-доску", completed: true },
      { title: "Провести встречу", completed: false },
      { title: "Записать action items", completed: false },
    ],
  },
  {
    title: "Бэкап базы данных",
    description: "Сделать ручной бэкап PostgreSQL перед деплоем новой миграции.",
    priority: "high",
    due_date: "2026-04-16",
    tag: "Operations",
    completed: true,
    subtasks: [
      { title: "Запустить pg_dump", completed: true },
      { title: "Загрузить дамп в S3", completed: true },
    ],
  },
];

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("Connected to database.");

    await sequelize.sync();

    const existing = await User.findOne({ where: { email: TEST_USER.email } });
    if (existing) {
      console.log(`User ${TEST_USER.email} already exists (id=${existing.id}). Aborting.`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(TEST_USER.password, 10);
    const user = await User.create({
      email: TEST_USER.email,
      password_hash: passwordHash,
    });
    console.log(`Created user: ${user.email} (id=${user.id})`);

    for (const taskData of TASKS) {
      const { subtasks: subtaskList, ...taskFields } = taskData;
      const task = await Task.create({ ...taskFields, user_id: user.id });

      if (subtaskList.length > 0) {
        await Subtask.bulkCreate(
          subtaskList.map((s) => ({ ...s, task_id: task.id }))
        );
      }
      console.log(`  + ${task.title} (${subtaskList.length} subtasks)`);
    }

    console.log(`\nDone! Created ${TASKS.length} tasks for ${TEST_USER.email}`);
    console.log(`Login: ${TEST_USER.email} / ${TEST_USER.password}`);
  } catch (err) {
    console.error("Seed failed:", err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

seed();
