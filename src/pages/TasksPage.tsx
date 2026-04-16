import { Alert, Snackbar } from "@mui/material";
import { useEffect, useEffectEvent } from "react";
import { Outlet, useLocation } from "react-router-dom";
import loadingSpinnerIcon from "../assets/tasks-loading-spinner.svg";
import CreateTaskModal from "../features/tasks/components/CreateTaskModal";
import TaskDeleteModal from "../features/tasks/components/TaskDeleteModal";
import TaskErrorModal from "../features/tasks/components/TaskErrorModal";
import TasksHeader from "../features/tasks/components/TasksHeader";
import TasksViewTabs from "../features/tasks/components/TasksViewTabs";
import { useTasksPageModel } from "../features/tasks/model/useTasksPageModel";
import { useI18n } from "../shared/i18n/useI18n";

const SEARCH_INPUT_ID = "tasks-search";

function isEditableKeyboardTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();

  return (
    target.isContentEditable ||
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.getAttribute("role") === "textbox"
  );
}

function TasksPage() {
  const model = useTasksPageModel();
  const location = useLocation();
  const { t } = useI18n();
  const headerSubtitle = location.pathname.startsWith("/tasks/calendar")
    ? t("tasks.deadlineCalendar")
    : undefined;

  const handleGlobalKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (
      model.isLoading ||
      event.defaultPrevented ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.repeat ||
      isEditableKeyboardTarget(event.target) ||
      document.querySelector('[role="dialog"]')
    ) {
      return;
    }

    if (event.key.toLowerCase() === "n") {
      event.preventDefault();
      model.openCreateTaskModal();

      return;
    }

    if (event.key !== "/") {
      return;
    }

    const searchInput = document.getElementById(SEARCH_INPUT_ID);

    if (!(searchInput instanceof HTMLElement)) {
      return;
    }

    event.preventDefault();
    searchInput.focus();
  });

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      handleGlobalKeyDown(event);
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (model.isLoading) {
    return (
      <div className="tasks-page">
        <TasksHeader pending={0} done={0} total={0} subtitle={headerSubtitle} />
        <hr className="tasks-page__header-divider" />
        <TasksViewTabs />
        <div className="tasks-page__loading-state" aria-label={t("tasks.loadingTasks")} role="status">
          <img src={loadingSpinnerIcon} alt="" width="40" height="40" aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-page">
      <TasksHeader
        pending={model.summary.pending}
        done={model.summary.done}
        total={model.summary.total}
        subtitle={headerSubtitle}
      />
      <hr className="tasks-page__header-divider" />
      <TasksViewTabs />

      {model.error ? <div className="tasks-page__section-heading">{model.error}</div> : null}
      {model.error ? null : <Outlet context={model} />}

      <CreateTaskModal
        isOpen={model.createTaskModal.isOpen}
        mode={model.createTaskModal.mode}
        formValues={model.createTaskModal.formValues}
        fieldErrors={model.createTaskModal.fieldErrors}
        formError={model.createTaskModal.formError}
        isSubmitting={model.createTaskModal.isSubmitting}
        onClose={model.createTaskModal.close}
        onFieldChange={model.createTaskModal.onFieldChange}
        onSubtaskAdd={model.createTaskModal.onSubtaskAdd}
        onSubtaskRemove={model.createTaskModal.onSubtaskRemove}
        onSubmit={model.createTaskModal.onSubmit}
      />

      <TaskErrorModal
        open={model.completionError !== null}
        message={model.completionError ?? ""}
        onClose={model.dismissCompletionError}
      />

      <Snackbar
        autoHideDuration={3000}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={model.shareFeedbackMessage !== null}
        onClose={model.dismissShareFeedback}
      >
        <Alert severity="success" variant="filled" onClose={model.dismissShareFeedback}>
          {model.shareFeedbackMessage ?? ""}
        </Alert>
      </Snackbar>

      <TaskDeleteModal
        isOpen={model.deleteTaskModal.isOpen}
        taskTitle={model.deleteTaskModal.taskTitle}
        taskCount={model.deleteTaskModal.taskCount}
        error={model.deleteTaskModal.error}
        isDeleting={model.deleteTaskModal.isDeleting}
        onClose={model.deleteTaskModal.close}
        onConfirm={model.deleteTaskModal.confirm}
      />
    </div>
  );
}

export default TasksPage;
