import { useTaskModals } from "./useTaskModals";
import { useTaskMutations } from "./useTaskMutations";
import { useTaskQueries } from "./useTaskQueries";
import { useTaskSelection } from "./useTaskSelection";

export function useTasksPageModel() {
  const queries = useTaskQueries();
  const selection = useTaskSelection({
    tasks: queries.filteredTasks,
    searchQuery: queries.searchQuery,
    priorityFilter: queries.priorityFilter,
    statusFilter: queries.statusFilter,
  });
  const modals = useTaskModals();
  const mutations = useTaskMutations({
    tasks: queries.tasks,
    setTasks: queries.setTasks,
    reloadTasks: queries.reloadTasks,
    selection: {
      selectedTasks: selection.selectedTasks,
      completionTarget: selection.completionTarget,
      clearSelection: selection.clearSelection,
      replaceSelection: selection.replaceSelection,
    },
    taskModal: {
      editingTaskId: modals.taskModal.editingTaskId,
      formValues: modals.taskModal.formValues,
      setFieldErrors: modals.taskModal.setFieldErrors,
      setFormError: modals.taskModal.setFormError,
      setIsSubmitting: modals.taskModal.setIsSubmitting,
      closeTaskModal: modals.taskModal.closeTaskModal,
    },
    deleteModal: {
      deleteTarget: modals.deleteModal.deleteTarget,
      setDeleteError: modals.deleteModal.setDeleteError,
      closeDeleteTaskModal: modals.deleteModal.closeDeleteTaskModal,
    },
  });

  function openBulkDeleteModal() {
    modals.deleteModal.openBulkDeleteModal(
      selection.selectedTaskIds,
      selection.selectedTasks[0]?.title ?? "",
    );
  }

  function closeDeleteTaskModal() {
    if (mutations.bulkAction === "delete") {
      return;
    }

    modals.deleteModal.closeDeleteTaskModal();
  }

  const deleteTarget = modals.deleteModal.deleteTarget;
  const isDeletingTask =
    deleteTarget?.mode === "bulk"
      ? mutations.bulkAction === "delete"
      : deleteTarget !== null && mutations.pendingTaskIds.includes(deleteTarget.task.id);
  let deleteTaskCount = 0;

  if (deleteTarget?.mode === "bulk") {
    deleteTaskCount = deleteTarget.taskCount;
  } else if (deleteTarget !== null) {
    deleteTaskCount = 1;
  }

  const deleteTaskTitle =
    deleteTarget?.mode === "bulk" ? deleteTarget.taskTitle : deleteTarget?.task.title ?? "";

  return {
    isLoading: queries.isLoading,
    error: queries.error,
    tasks: queries.liveTasks,
    completionError: mutations.completionError,
    shareFeedbackMessage: mutations.shareFeedbackMessage,
    openCreateTaskModal: modals.taskModal.openCreateTaskModal,
    dismissCompletionError: mutations.dismissCompletionError,
    dismissShareFeedback: mutations.dismissShareFeedback,
    summary: queries.summary,
    toolbar: {
      searchQuery: queries.searchQuery,
      sortBy: queries.sortBy,
      priorityFilter: queries.priorityFilter,
      statusFilter: queries.statusFilter,
      setSearchQuery: queries.setSearchQuery,
      setSortBy: queries.setSortBy,
      setPriorityFilter: queries.setPriorityFilter,
      setStatusFilter: queries.setStatusFilter,
      openCreateTaskModal: modals.taskModal.openCreateTaskModal,
    },
    taskLists: {
      activeTasks: queries.activeTasks,
      completedTasks: queries.completedTasks,
      deletedTasks: queries.deletedTasks,
      isDeletedView: queries.statusFilter === "deleted",
      visibleCount: queries.visibleCount,
      pendingTaskIds: mutations.pendingTaskIds,
      selectedTaskIds: selection.selectedTaskIds,
      selectedTasks: selection.selectedTasks,
      selectedCount: selection.selectedCount,
      canUpdateCompletion: selection.canUpdateCompletion,
      completionAction: selection.completionAction,
      isBulkActionPending: mutations.bulkAction !== null,
      toggleTaskCompletion: mutations.toggleTaskCompletion,
      toggleSubtaskCompletion: mutations.toggleSubtaskCompletion,
      onTaskSelectionChange: selection.onTaskSelectionChange,
      clearSelection: selection.clearSelection,
      updateSelectedTasksCompletion: mutations.updateSelectedTasksCompletion,
      openBulkDeleteModal,
      updateSelectedTasksPriority: mutations.updateSelectedTasksPriority,
      restoreTask: mutations.restoreTask,
      restoreSelectedTasks: mutations.restoreSelectedTasks,
      openEditTaskModal: modals.taskModal.openEditTaskModal,
      openDeleteTaskModal: modals.deleteModal.openDeleteTaskModal,
      shareTask: mutations.shareTask,
      revokeTaskShare: mutations.revokeTaskShare,
    },
    createTaskModal: {
      isOpen: modals.taskModal.isOpen,
      mode: modals.taskModal.mode,
      formValues: modals.taskModal.formValues,
      fieldErrors: modals.taskModal.fieldErrors,
      formError: modals.taskModal.formError,
      isSubmitting: modals.taskModal.isSubmitting,
      close: modals.taskModal.closeTaskModal,
      onFieldChange: modals.taskModal.onFieldChange,
      onSubtaskAdd: modals.taskModal.onSubtaskAdd,
      onSubtaskRemove: modals.taskModal.onSubtaskRemove,
      onSubmit: mutations.onTaskSubmit,
    },
    deleteTaskModal: {
      isOpen: deleteTarget !== null,
      taskTitle: deleteTaskTitle,
      taskCount: deleteTaskCount,
      error: modals.deleteModal.deleteError,
      isDeleting: isDeletingTask,
      close: closeDeleteTaskModal,
      confirm: mutations.confirmTaskDelete,
    },
  };
}
