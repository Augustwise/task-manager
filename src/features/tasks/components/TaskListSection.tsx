import type { TaskListSectionProps } from "../types/components";
import { useI18n } from "../../../shared/i18n/useI18n";
import TaskCard from "./TaskCard";

function TaskListSection({
  title,
  tasks,
  pendingTaskIds,
  selectedTaskIds,
  onTaskCompletionChange,
  onTaskSelectionChange,
  onSubtaskCompletionChange,
  onTaskEditClick,
  onTaskDeleteClick,
  onTaskRestoreClick,
  onTaskShareClick,
  onTaskShareRevokeClick,
}: TaskListSectionProps) {
  const { t } = useI18n();

  return (
    <>
      <div className="tasks-page__section-heading">
        {t("tasks.list.sectionHeading", { title, count: tasks.length })}
      </div>
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          checkboxMode="select"
          isUpdating={pendingTaskIds.includes(task.id)}
          isSelected={selectedTaskIds.includes(task.id)}
          onCompletionChange={onTaskCompletionChange}
          onSelectionChange={onTaskSelectionChange}
          onSubtaskCompletionChange={onSubtaskCompletionChange}
          onEditClick={onTaskEditClick}
          onDeleteClick={onTaskDeleteClick}
          onRestoreClick={onTaskRestoreClick}
          onShareClick={onTaskShareClick}
          onShareRevokeClick={onTaskShareRevokeClick}
        />
      ))}
    </>
  );
}

export default TaskListSection;
