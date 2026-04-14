import classNames from "classnames";
import { Link, useParams } from "react-router-dom";
import { useI18n } from "../../../shared/i18n/useI18n";
import type { TaskDto } from "../../../shared/types";
import TaskCard from "../../tasks/components/TaskCard";
import TasksColumnHeaders from "../../tasks/components/TasksColumnHeaders";
import { type DueStatus, calculateDueStatus } from "../model/dueDateStatus";

function ArrowLeftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="due-date-tasks__back-icon">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

const STATUS_CONFIG: Record<DueStatus, { dotModifier: string; translationKey: string }> = {
  overdue: { dotModifier: "due-date-list__dot--overdue", translationKey: "tasks.dashboard.overdue" },
  dueToday: { dotModifier: "due-date-list__dot--today", translationKey: "tasks.dashboard.dueToday" },
  thisWeek: { dotModifier: "due-date-list__dot--week", translationKey: "tasks.dashboard.thisWeek" },
  onTrack: { dotModifier: "due-date-list__dot--track", translationKey: "tasks.dashboard.onTrack" },
};

function isValidDueStatus(value: string): value is DueStatus {
  return value in STATUS_CONFIG;
}

interface DueDateTasksViewProps {
  readonly tasks: readonly TaskDto[];
  readonly pendingTaskIds: readonly number[];
  readonly onTaskCompletionChange: (taskId: number, completed: boolean) => void;
  readonly onSubtaskCompletionChange: (taskId: number, subtaskId: number, completed: boolean) => void;
  readonly onTaskEditClick: (task: TaskDto) => void;
  readonly onTaskDeleteClick: (task: TaskDto) => void;
  readonly onTaskShareClick: (task: TaskDto) => void;
  readonly onTaskShareRevokeClick: (task: TaskDto) => void;
}

function DueDateTasksView({
  tasks,
  pendingTaskIds,
  onTaskCompletionChange,
  onSubtaskCompletionChange,
  onTaskEditClick,
  onTaskDeleteClick,
  onTaskShareClick,
  onTaskShareRevokeClick,
}: DueDateTasksViewProps) {
  const { status } = useParams<{ status: string }>();
  const { t } = useI18n();

  if (!status || !isValidDueStatus(status)) {
    return (
      <div className="due-date-tasks">
        <Link to="/tasks/dashboard" className="due-date-tasks__back">
          <ArrowLeftIcon />
          {t("tasks.dueDateTasks.backToDashboard")}
        </Link>
      </div>
    );
  }

  const config = STATUS_CONFIG[status];
  const filteredTasks = tasks.filter((task) => calculateDueStatus(task) === status);

  return (
    <div className="due-date-tasks">
      <Link to="/tasks/dashboard" className="due-date-tasks__back">
        <ArrowLeftIcon />
        {t("tasks.dueDateTasks.backToDashboard")}
      </Link>

      <div className="due-date-tasks__header">
        <span className={classNames("due-date-list__dot", config.dotModifier)} />
        <h2 className="due-date-tasks__title">{t(config.translationKey)}</h2>
        <span className="due-date-tasks__count">{filteredTasks.length}</span>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="tasks-page__empty-state">{t("tasks.dueDateTasks.empty")}</div>
      ) : (
        <>
          <TasksColumnHeaders />
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              checkboxMode="complete"
              isUpdating={pendingTaskIds.includes(task.id)}
              onCompletionChange={onTaskCompletionChange}
              onSubtaskCompletionChange={onSubtaskCompletionChange}
              onEditClick={onTaskEditClick}
              onDeleteClick={onTaskDeleteClick}
              onShareClick={onTaskShareClick}
              onShareRevokeClick={onTaskShareRevokeClick}
            />
          ))}
        </>
      )}
    </div>
  );
}

export default DueDateTasksView;
