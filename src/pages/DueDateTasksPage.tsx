import { useOutletContext } from "react-router-dom";
import DueDateTasksView from "../features/dashboard/components/DueDateTasksView";
import type { TasksPageModel } from "../features/tasks/types/model";

function DueDateTasksPage() {
  const model = useOutletContext<TasksPageModel>();

  return (
    <DueDateTasksView
      tasks={model.tasks}
      pendingTaskIds={model.taskLists.pendingTaskIds}
      onTaskCompletionChange={model.taskLists.toggleTaskCompletion}
      onSubtaskCompletionChange={model.taskLists.toggleSubtaskCompletion}
      onTaskEditClick={model.taskLists.openEditTaskModal}
      onTaskDeleteClick={model.taskLists.openDeleteTaskModal}
      onTaskShareClick={model.taskLists.shareTask}
      onTaskShareRevokeClick={model.taskLists.revokeTaskShare}
    />
  );
}

export default DueDateTasksPage;
