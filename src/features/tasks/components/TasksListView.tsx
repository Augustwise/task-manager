import { Box } from "@mui/material";
import { useEffect, useEffectEvent } from "react";
import TaskListSection from "./TaskListSection";
import TasksBulkActionBar from "./TasksBulkActionBar";
import TasksColumnHeaders from "./TasksColumnHeaders";
import TasksProgress from "./TasksProgress";
import TasksToolbar from "./TasksToolbar";
import { useI18n } from "../../../shared/i18n/useI18n";
import type { TasksListViewProps } from "../types/components";

function TasksListView({ model }: TasksListViewProps) {
  const { t } = useI18n();
  const isDeletedView = model.taskLists.isDeletedView;
  const dragEnabled = model.toolbar.sortBy === "manual" && !isDeletedView;
  const clearSelectionOnUnmount = useEffectEvent(() => {
    model.taskLists.clearSelection();
  });

  useEffect(() => {
    return () => {
      clearSelectionOnUnmount();
    };
  }, []);

  return (
    <>
      <TasksToolbar
        searchQuery={model.toolbar.searchQuery}
        sortBy={model.toolbar.sortBy}
        priorityFilter={model.toolbar.priorityFilter}
        statusFilter={model.toolbar.statusFilter}
        onCreateTaskClick={model.toolbar.openCreateTaskModal}
        onSearchQueryChange={model.toolbar.setSearchQuery}
        onSortByChange={model.toolbar.setSortBy}
        onPriorityFilterChange={model.toolbar.setPriorityFilter}
        onStatusFilterChange={model.toolbar.setStatusFilter}
      />

      <TasksColumnHeaders />

      {isDeletedView ? (
        <TaskListSection
          title={t("common.deleted")}
          tasks={model.taskLists.deletedTasks}
          pendingTaskIds={model.taskLists.pendingTaskIds}
          selectedTaskIds={model.taskLists.selectedTaskIds}
          onTaskCompletionChange={model.taskLists.toggleTaskCompletion}
          onTaskSelectionChange={model.taskLists.onTaskSelectionChange}
          onSubtaskCompletionChange={model.taskLists.toggleSubtaskCompletion}
          onTaskEditClick={model.taskLists.openEditTaskModal}
          onTaskDeleteClick={model.taskLists.openDeleteTaskModal}
          onTaskRestoreClick={(task) => {
            void model.taskLists.restoreTask(task.id);
          }}
          onTaskShareClick={model.taskLists.shareTask}
          onTaskShareRevokeClick={model.taskLists.revokeTaskShare}
        />
      ) : (
        <>
          <TaskListSection
            title={t("common.active")}
            tasks={model.taskLists.activeTasks}
            pendingTaskIds={model.taskLists.pendingTaskIds}
            selectedTaskIds={model.taskLists.selectedTaskIds}
            dragEnabled={dragEnabled}
            onTaskCompletionChange={model.taskLists.toggleTaskCompletion}
            onTaskSelectionChange={model.taskLists.onTaskSelectionChange}
            onSubtaskCompletionChange={model.taskLists.toggleSubtaskCompletion}
            onTaskEditClick={model.taskLists.openEditTaskModal}
            onTaskDeleteClick={model.taskLists.openDeleteTaskModal}
            onTaskShareClick={model.taskLists.shareTask}
            onTaskShareRevokeClick={model.taskLists.revokeTaskShare}
            onTaskReorder={(orderedIds) => {
              void model.taskLists.reorderTasks([
                ...orderedIds,
                ...model.taskLists.completedTasks.map((task) => task.id),
              ]);
            }}
          />
          <TaskListSection
            title={t("common.completed")}
            tasks={model.taskLists.completedTasks}
            pendingTaskIds={model.taskLists.pendingTaskIds}
            selectedTaskIds={model.taskLists.selectedTaskIds}
            dragEnabled={dragEnabled}
            onTaskCompletionChange={model.taskLists.toggleTaskCompletion}
            onTaskSelectionChange={model.taskLists.onTaskSelectionChange}
            onSubtaskCompletionChange={model.taskLists.toggleSubtaskCompletion}
            onTaskEditClick={model.taskLists.openEditTaskModal}
            onTaskDeleteClick={model.taskLists.openDeleteTaskModal}
            onTaskShareClick={model.taskLists.shareTask}
            onTaskShareRevokeClick={model.taskLists.revokeTaskShare}
            onTaskReorder={(orderedIds) => {
              void model.taskLists.reorderTasks([
                ...model.taskLists.activeTasks.map((task) => task.id),
                ...orderedIds,
              ]);
            }}
          />
        </>
      )}

      {model.taskLists.visibleCount === 0 ? (
        <div className="tasks-page__empty-state">{t("tasks.list.empty")}</div>
      ) : null}

      <TasksProgress
        done={model.summary.done}
        total={model.summary.total}
        progressPct={model.summary.progressPct}
      />

      {model.taskLists.selectedCount > 0 ? (
        <Box aria-hidden="true" sx={{ height: { xs: 164, md: 112 } }} />
      ) : null}

      <TasksBulkActionBar
        selectedCount={model.taskLists.selectedCount}
        selectedTasks={model.taskLists.selectedTasks}
        canUpdateCompletion={model.taskLists.canUpdateCompletion}
        isPending={model.taskLists.isBulkActionPending}
        showRestoreAction={model.taskLists.isDeletedView}
        completionAction={model.taskLists.completionAction}
        onUpdateCompletion={model.taskLists.updateSelectedTasksCompletion}
        onRestore={model.taskLists.restoreSelectedTasks}
        onDelete={model.taskLists.openBulkDeleteModal}
        onClearSelection={model.taskLists.clearSelection}
        onApplyPriority={model.taskLists.updateSelectedTasksPriority}
      />
    </>
  );
}

export default TasksListView;
