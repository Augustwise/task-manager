import classNames from "classnames";
import { Checkbox } from "@mui/material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import editIcon from "../../../assets/icon-edit.svg";
import recurrenceIcon from "../../../assets/icon-recurrence.svg";
import sharePrivateIcon from "../../../assets/icon-share-private.svg";
import sharePublicIcon from "../../../assets/icon-share-public.svg";
import trashIcon from "../../../assets/icon-trash.svg";
import { useI18n } from "../../../shared/i18n/useI18n";
import type { SupportedLanguage } from "../../../shared/i18n";
import { getTaskRestoreDeadline, isTaskDeleted } from "../lib/archive";
import { getTodayParts, parseIsoDate } from "../lib/calendarDate";
import type { TaskCardProps } from "../types/components";

function formatDueDate(dateStr: string, language: SupportedLanguage): string {
  if (language === "en") {
    return dateStr;
  }

  const parts = parseIsoDate(dateStr);

  if (!parts) {
    return dateStr;
  }

  const day = parts.day.toString().padStart(2, "0");
  const month = parts.month.toString().padStart(2, "0");

  return `${day}.${month}.${parts.year}`;
}

function dueDateClass(dateStr: string): string {
  if (!dateStr) {
    return "task-card__due-date--normal";
  }

  const dueDate = parseIsoDate(dateStr);

  if (!dueDate) {
    return "task-card__due-date--normal";
  }

  // Convert both dates to local midnight timestamps so we can compare whole calendar days.
  const today = getTodayParts();
  const dueDateValue = new Date(dueDate.year, dueDate.month - 1, dueDate.day).getTime();
  const todayValue = new Date(today.year, today.month - 1, today.day).getTime();
  const diffDays = Math.round((dueDateValue - todayValue) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "task-card__due-date--overdue";
  }

  if (diffDays <= 4) {
    return "task-card__due-date--soon";
  }

  return "task-card__due-date--normal";
}

function formatArchiveDate(value: string, locale: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(date);
}

function TaskCard({
  task,
  isUpdating,
  checkboxMode,
  isSelected = false,
  dragEnabled = false,
  onCompletionChange,
  onSelectionChange,
  onSubtaskCompletionChange,
  onEditClick,
  onDeleteClick,
  onRestoreClick,
  onShareClick,
  onShareRevokeClick,
}: TaskCardProps) {
  const subtaskTotal = task.subtasks.length;
  const hasDescription = task.description.trim().length > 0;
  const hasDueDate = task.dueDate.trim().length > 0;
  const hasTag = task.tag.trim().length > 0;
  const isShared = task.shareToken !== null;
  const isRecurring = (task.recurrence ?? "none") !== "none";
  const isDeleted = isTaskDeleted(task);
  const restoreDeadline = getTaskRestoreDeadline(task);
  const { t, language, locale } = useI18n();
  const isSelectionMode = checkboxMode === "select";
  const checkboxChecked = isSelectionMode ? isSelected : task.completed;
  const shareActionLabel = isShared
    ? t("tasks.card.copyLinkAriaLabel")
    : t("tasks.card.createLinkAriaLabel");
  const revokeShareLabel = t("tasks.card.revokeLinkAriaLabel");
  const restoreActionLabel = t("tasks.card.restoreTaskAriaLabel");
  const checkboxAriaLabel = isSelectionMode
    ? t("tasks.card.toggleSelectionAriaLabel", {
        title: task.title,
        selected: isSelected,
      })
    : t("tasks.card.markTaskAriaLabel", {
        title: task.title,
        completed: task.completed,
      });
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !dragEnabled || isUpdating });
  const dragStyle: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={dragEnabled ? dragStyle : undefined}
      className={classNames("task-card", {
        "task-card--deleted": isDeleted,
        "task-card--selected": isSelected,
        "task-card--updating": isUpdating,
        "task-card--draggable": dragEnabled,
        "task-card--dragging": isDragging,
      })}
    >
      {dragEnabled ? (
        <button
          type="button"
          className="task-card__drag-handle"
          aria-label={t("tasks.card.dragHandleAriaLabel", { title: task.title })}
          disabled={isUpdating}
          {...attributes}
          {...listeners}
        >
          <span aria-hidden="true" className="task-card__drag-handle-dots" />
        </button>
      ) : null}
      <Checkbox
        className="task-card__checkbox"
        checked={checkboxChecked}
        disabled={isUpdating || (isDeleted && !isSelectionMode)}
        disableRipple
        size="small"
        onChange={(event) => {
          if (isSelectionMode) {
            onSelectionChange?.(task.id, event.target.checked);
            return;
          }

          onCompletionChange(task.id, event.target.checked);
        }}
        inputProps={{ "aria-label": checkboxAriaLabel }}
        sx={{
          position: "absolute",
          top: 12,
          left: dragEnabled ? "2.25rem" : 12,
          padding: "4px",
          color: "rgba(58, 142, 246, 0.45)",
          "&.Mui-checked": {
            color: "#3a8ef6",
          },
          "&.Mui-disabled": {
            color: "rgba(58, 142, 246, 0.28)",
          },
        }}
      />
      <div className="task-card__content">
        <div className="task-card__header">
          <div
            className={classNames("task-card__title", {
              "task-card__title--completed": task.completed,
              "task-card__title--deleted": isDeleted,
            })}
          >
            {task.title}
          </div>
          <div className="task-card__controls">
            {isDeleted ? (
              <div className="task-card__action-group task-card__action-group--share">
                <button
                  type="button"
                  className="task-card__action task-card__action--restore"
                  aria-label={restoreActionLabel}
                  disabled={isUpdating || !onRestoreClick}
                  onClick={() => onRestoreClick?.(task)}
                >
                  {t("tasks.card.restoreTaskLabel")}
                </button>
              </div>
            ) : (
              <>
                <div className="task-card__action-group task-card__action-group--share">
                  <button
                    type="button"
                    className={classNames(
                      "task-card__action task-card__action--icon task-card__action--share-link",
                      {
                        "task-card__action--share-link-active": isShared,
                      },
                    )}
                    aria-label={shareActionLabel}
                    title={shareActionLabel}
                    disabled={isUpdating}
                    onClick={() => onShareClick(task)}
                  >
                    <img src={sharePublicIcon} alt="" width="18" height="18" />
                  </button>
                  {isShared ? (
                    <button
                      type="button"
                      className="task-card__action task-card__action--icon task-card__action--share-link-off"
                      aria-label={revokeShareLabel}
                      title={revokeShareLabel}
                      disabled={isUpdating}
                      onClick={() => onShareRevokeClick(task)}
                    >
                      <img src={sharePrivateIcon} alt="" width="18" height="18" />
                    </button>
                  ) : null}
                </div>
                <div className="task-card__icon-actions">
                  <button
                    type="button"
                    className="task-card__action task-card__action--icon"
                    aria-label={t("tasks.card.editTaskAriaLabel")}
                    disabled={isUpdating}
                    onClick={() => onEditClick(task)}
                  >
                    <img src={editIcon} alt="" width="16" height="16" />
                  </button>
                  <button
                    type="button"
                    className="task-card__action task-card__action--icon"
                    aria-label={t("tasks.card.deleteTaskAriaLabel")}
                    disabled={isUpdating}
                    onClick={() => onDeleteClick(task)}
                  >
                    <img src={trashIcon} alt="" width="16" height="16" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <div
          className={classNames("task-card__description", {
            "task-card__description--placeholder": !hasDescription,
          })}
        >
          {hasDescription ? task.description : t("tasks.card.noDescription")}
        </div>

        {subtaskTotal > 0 && (
          <div className="task-card__subtasks">
            <ul className="task-card__subtask-list">
              {task.subtasks.map((subtask) => (
                <li key={subtask.id} className="task-card__subtask">
                  <input
                    type="checkbox"
                    className="task-card__subtask-checkbox"
                    checked={subtask.completed}
                    disabled={isUpdating || isDeleted}
                    onChange={(event) => {
                      onSubtaskCompletionChange(task.id, subtask.id, event.target.checked);
                    }}
                    aria-label={t("tasks.card.markSubtaskAriaLabel", {
                      title: subtask.title,
                      completed: subtask.completed,
                    })}
                  />
                  <span
                    className={classNames("task-card__subtask-title", {
                      "task-card__subtask-title--completed": subtask.completed,
                    })}
                  >
                    {subtask.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <div className="task-card__meta">
        {isDeleted ? (
          <span className="task-card__archive-badge">{t("common.deleted")}</span>
        ) : null}
        <span className={classNames("priority-badge", `priority-badge--${task.priority}`)}>
          {t(`common.priorityLevels.${task.priority}`)}
        </span>
        {hasDueDate ? (
          <span
            className={classNames(
              "task-card__due-date",
              task.completed ? "task-card__due-date--completed" : dueDateClass(task.dueDate),
            )}
          >
            {formatDueDate(task.dueDate, language)}
          </span>
        ) : null}
        {hasTag ? <span className="tag-badge">{task.tag}</span> : null}
        {isRecurring ? (
          <span
            className="recurrence-badge"
            title={t("tasks.card.recurringTitle", {
              label: t(`tasks.recurrence.${task.recurrence}`),
            })}
          >
            <img
              src={recurrenceIcon}
              alt=""
              width="14"
              height="14"
              className="recurrence-badge__icon"
            />
            <span className="recurrence-badge__label">
              {t(`tasks.recurrence.${task.recurrence}`)}
            </span>
          </span>
        ) : null}
        {restoreDeadline ? (
          <span className="task-card__archive-note">
            {t("tasks.archive.restorableUntil", {
              date: formatArchiveDate(restoreDeadline.toISOString(), locale),
            })}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default TaskCard;
