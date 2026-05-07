import classNames from "classnames";
import { useRef, useState, type TouchEvent } from "react";
import { useI18n } from "../../../shared/i18n/useI18n";
import type { TaskDto } from "../../../shared/types";
import TaskCard from "./TaskCard";
import {
  addMonths,
  formatIsoDate,
  getCalendarMonth,
  getFirstSelectableDate,
  getMonthGrid,
  getMonthLabel,
  getTodayIsoDate,
  getTodayParts,
  getWeekdayLabels,
  isSameCalendarMonth,
  toIsoDate,
} from "../lib/calendarDate";
import { getTaskOccurrencesInRange } from "../lib/recurrence";
import type { TasksCalendarViewProps } from "../types/components";
import type { CalendarMonth } from "../types/calendar";

const PRIORITY_ORDER: Record<TaskDto["priority"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const SWIPE_THRESHOLD = 56;
const SWIPE_VERTICAL_TOLERANCE = 80;

function CalendarArrowIcon({ direction }: { direction: "previous" | "next" }) {
  const path =
    direction === "previous"
      ? "M14.75 5.75L8.5 12l6.25 6.25"
      : "M9.25 5.75L15.5 12l-6.25 6.25";

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function sortTasksForCalendar(tasks: TaskDto[]): TaskDto[] {
  return [...tasks].sort((left, right) => {
    return (
      Number(left.completed) - Number(right.completed) ||
      PRIORITY_ORDER[left.priority] - PRIORITY_ORDER[right.priority] ||
      left.title.localeCompare(right.title) ||
      left.id - right.id
    );
  });
}

function getTasksByDate(
  tasks: TaskDto[],
  visibleMonth: CalendarMonth,
): Map<string, TaskDto[]> {
  const groupedTasks = new Map<string, TaskDto[]>();
  const grid = getMonthGrid(visibleMonth);
  const rangeStart = toIsoDate(grid[0]);
  const rangeEnd = toIsoDate(grid[grid.length - 1]);

  tasks.forEach((task) => {
    const occurrences = getTaskOccurrencesInRange(task, rangeStart, rangeEnd);

    occurrences.forEach((isoDate) => {
      const currentTasks = groupedTasks.get(isoDate) ?? [];
      currentTasks.push(task);
      groupedTasks.set(isoDate, currentTasks);
    });
  });

  groupedTasks.forEach((dayTasks, isoDate) => {
    groupedTasks.set(isoDate, sortTasksForCalendar(dayTasks));
  });

  return groupedTasks;
}

function TasksCalendarView({ model }: TasksCalendarViewProps) {
  const { locale, t } = useI18n();
  const todayParts = getTodayParts();
  const todayIsoDate = getTodayIsoDate();
  const todayMonth = getCalendarMonth(todayParts);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [visibleMonth, setVisibleMonth] = useState<CalendarMonth>(todayMonth);
  const [selectedDate, setSelectedDate] = useState(() => todayIsoDate);
  const tasksByDate = getTasksByDate(model.tasks, visibleMonth);
  const weekdayLabels = getWeekdayLabels(locale);

  const calendarDays = getMonthGrid(visibleMonth).map((parts) => {
    const isoDate = toIsoDate(parts);

    return {
      isoDate,
      dayNumber: parts.day,
      inCurrentMonth:
        parts.year === visibleMonth.year && parts.month === visibleMonth.month,
      isToday: isoDate === todayIsoDate,
      isSelected: isoDate === selectedDate,
      tasks: tasksByDate.get(isoDate) ?? [],
      month: parts.month,
      year: parts.year,
    };
  });
  const selectedTasks = tasksByDate.get(selectedDate) ?? [];
  const selectedDateLabel = formatIsoDate(
    selectedDate,
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
    locale,
  );
  const selectedDateShortLabel = formatIsoDate(
    selectedDate,
    {
      month: "long",
      day: "numeric",
    },
    locale,
  );

  function selectMonth(nextMonth: CalendarMonth) {
    setVisibleMonth(nextMonth);

    if (isSameCalendarMonth(nextMonth, todayMonth)) {
      setSelectedDate(todayIsoDate);
      return;
    }

    const nextMonthDueDates = [...getTasksByDate(model.tasks, nextMonth).keys()];
    setSelectedDate(getFirstSelectableDate(nextMonth, nextMonthDueDates));
  }

  function handleDaySelect(isoDate: string, year: number, month: number) {
    setSelectedDate(isoDate);

    if (year !== visibleMonth.year || month !== visibleMonth.month) {
      setVisibleMonth({ year, month });
    }
  }

  function showPreviousMonth() {
    selectMonth(addMonths(visibleMonth, -1));
  }

  function showNextMonth() {
    selectMonth(addMonths(visibleMonth, 1));
  }

  function handleCalendarTouchStart(event: TouchEvent<HTMLDivElement>) {
    const touch = event.changedTouches[0];

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
    };
  }

  function handleCalendarTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const touchStart = touchStartRef.current;

    touchStartRef.current = null;

    if (!touchStart) {
      return;
    }

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    if (
      Math.abs(deltaX) < SWIPE_THRESHOLD ||
      Math.abs(deltaY) > SWIPE_VERTICAL_TOLERANCE ||
      Math.abs(deltaY) > Math.abs(deltaX)
    ) {
      return;
    }

    if (deltaX < 0) {
      showNextMonth();
      return;
    }

    showPreviousMonth();
  }

  return (
    <section className="tasks-page__calendar">
      <div className="tasks-page__calendar-controls">
        <div className="tasks-page__calendar-heading">
          <div className="tasks-page__calendar-title-row">
            <h2 className="tasks-page__calendar-title">{getMonthLabel(visibleMonth, locale)}</h2>
            <div
              className="tasks-page__calendar-month-nav"
              role="group"
              aria-label={t("tasks.calendar.changeMonth")}
            >
              <button
                type="button"
                className="tasks-page__calendar-nav-icon"
                onClick={showPreviousMonth}
                aria-label={t("tasks.calendar.showPreviousMonth")}
              >
                <CalendarArrowIcon direction="previous" />
              </button>
              <button
                type="button"
                className="tasks-page__calendar-nav-icon"
                onClick={showNextMonth}
                aria-label={t("tasks.calendar.showNextMonth")}
              >
                <CalendarArrowIcon direction="next" />
              </button>
            </div>
          </div>
          <p className="tasks-page__calendar-subtitle">
            {t("tasks.calendar.subtitle")}
          </p>
        </div>

        <div className="tasks-page__calendar-actions">
          <button
            type="button"
            className="tasks-page__calendar-secondary-button"
            onClick={() => selectMonth(todayMonth)}
          >
            {t("common.today")}
          </button>
          <button
            type="button"
            className="tasks-page__new-task-btn tasks-page__new-task-btn--calendar"
            onClick={model.openCreateTaskModal}
          >
            {t("tasks.toolbar.newTask")}
          </button>
        </div>
      </div>

      <div className="tasks-page__calendar-layout">
        <div className="tasks-page__calendar-board">
          <div
            className="tasks-page__calendar-swipe-surface"
            onTouchStart={handleCalendarTouchStart}
            onTouchEnd={handleCalendarTouchEnd}
            onTouchCancel={() => {
              touchStartRef.current = null;
            }}
          >
            <div className="tasks-page__calendar-weekdays" aria-hidden="true">
              {weekdayLabels.map((label) => (
                <span key={label} className="tasks-page__calendar-weekday">
                  {label}
                </span>
              ))}
            </div>

            <div className="tasks-page__calendar-grid">
              {calendarDays.map((day) => (
                <button
                  key={day.isoDate}
                  type="button"
                  className={classNames("tasks-page__calendar-day", {
                    "tasks-page__calendar-day--outside": !day.inCurrentMonth,
                    "tasks-page__calendar-day--today": day.isToday,
                    "tasks-page__calendar-day--selected": day.isSelected,
                    "tasks-page__calendar-day--has-tasks": day.tasks.length > 0,
                  })}
                  onClick={() => handleDaySelect(day.isoDate, day.year, day.month)}
                  aria-pressed={day.isSelected}
                >
                  <span className="tasks-page__calendar-day-number">{day.dayNumber}</span>
                  {day.tasks.length > 0 ? (
                    <span className="tasks-page__calendar-task-count">{day.tasks.length}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>

        <aside className="tasks-page__calendar-panel" aria-live="polite">
          <div className="tasks-page__calendar-panel-header">
            <p className="tasks-page__calendar-panel-label">{t("tasks.calendar.selectedDay")}</p>
            <h3 className="tasks-page__calendar-panel-title">{selectedDateLabel}</h3>
            <p className="tasks-page__calendar-panel-count">
              {t("tasks.calendar.panelCount", { count: selectedTasks.length })}
            </p>
          </div>

          {selectedTasks.length > 0 ? (
            <div className="tasks-page__calendar-task-list">
              {selectedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  checkboxMode="complete"
                  isUpdating={model.taskLists.pendingTaskIds.includes(task.id)}
                  onCompletionChange={model.taskLists.toggleTaskCompletion}
                  onSubtaskCompletionChange={model.taskLists.toggleSubtaskCompletion}
                  onEditClick={model.taskLists.openEditTaskModal}
                  onDeleteClick={model.taskLists.openDeleteTaskModal}
                  onShareClick={model.taskLists.shareTask}
                  onShareRevokeClick={model.taskLists.revokeTaskShare}
                />
              ))}
            </div>
          ) : (
            <div className="tasks-page__calendar-empty-state">
              {t("tasks.calendar.empty", { date: selectedDateShortLabel })}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

export default TasksCalendarView;
