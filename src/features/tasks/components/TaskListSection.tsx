import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { TaskListSectionProps } from "../types/components";
import { useI18n } from "../../../shared/i18n/useI18n";
import TaskCard from "./TaskCard";

function TaskListSection({
  title,
  tasks,
  pendingTaskIds,
  selectedTaskIds,
  dragEnabled = false,
  onTaskCompletionChange,
  onTaskSelectionChange,
  onSubtaskCompletionChange,
  onTaskEditClick,
  onTaskDeleteClick,
  onTaskRestoreClick,
  onTaskShareClick,
  onTaskShareRevokeClick,
  onTaskReorder,
}: TaskListSectionProps) {
  const { t } = useI18n();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const taskIds = tasks.map((task) => task.id);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id || !onTaskReorder) {
      return;
    }

    const oldIndex = taskIds.indexOf(Number(active.id));
    const newIndex = taskIds.indexOf(Number(over.id));

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    onTaskReorder(arrayMove(taskIds, oldIndex, newIndex));
  }

  const cards = tasks.map((task) => (
    <TaskCard
      key={task.id}
      task={task}
      checkboxMode="select"
      dragEnabled={dragEnabled}
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
  ));

  return (
    <>
      <div className="tasks-page__section-heading">
        {t("tasks.list.sectionHeading", { title, count: tasks.length })}
      </div>
      {dragEnabled ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {cards}
          </SortableContext>
        </DndContext>
      ) : (
        cards
      )}
    </>
  );
}

export default TaskListSection;
