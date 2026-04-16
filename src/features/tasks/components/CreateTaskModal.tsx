import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
} from "@mui/material";
import closeIcon from "../../../assets/icon-close.svg";
import { type ChangeEvent, type KeyboardEvent, useId, useRef, useState } from "react";
import { useI18n } from "../../../shared/i18n/useI18n";
import type { CreateTaskDto, Recurrence } from "../../../shared/types";
import type { CreateTaskModalProps } from "../types/components";

function CreateTaskModal({
  isOpen,
  mode,
  formValues,
  fieldErrors,
  formError,
  isSubmitting,
  onClose,
  onFieldChange,
  onSubtaskAdd,
  onSubtaskRemove,
  onSubmit,
}: CreateTaskModalProps) {
  const { t } = useI18n();
  const titleId = mode === "create" ? "create-task-title" : "edit-task-title";
  const priorityOptions = [
    { value: "high", label: t("common.priorityLevels.high") },
    { value: "medium", label: t("common.priorityLevels.medium") },
    { value: "low", label: t("common.priorityLevels.low") },
  ] satisfies ReadonlyArray<{ label: string; value: CreateTaskDto["priority"] }>;
  const recurrenceOptions = [
    { value: "none", label: t("tasks.modal.recurrenceOptions.none") },
    { value: "daily", label: t("tasks.modal.recurrenceOptions.daily") },
    { value: "weekly", label: t("tasks.modal.recurrenceOptions.weekly") },
    { value: "monthly", label: t("tasks.modal.recurrenceOptions.monthly") },
  ] satisfies ReadonlyArray<{ label: string; value: Recurrence }>;
  const recurrenceValue: Recurrence = formValues.recurrence ?? "none";
  const isRecurring = recurrenceValue !== "none";
  const recurrenceEndMinDate = formValues.dueDate || undefined;
  const modalTitle = mode === "create" ? t("tasks.modal.newTitle") : t("tasks.modal.editTitle");
  const closeLabel = mode === "create" ? t("tasks.modal.closeNew") : t("tasks.modal.closeEdit");
  let submitLabel = t("tasks.modal.saving");

  if (!isSubmitting) {
    submitLabel = mode === "create" ? t("tasks.modal.saveTask") : t("tasks.modal.updateTask");
  }

  const [subtaskInput, setSubtaskInput] = useState("");
  const subtaskKeyPrefix = useId();
  const subtaskInputRef = useRef<HTMLInputElement>(null);

  const subtasks = formValues.subtasks ?? [];
  const subtaskTitleCounts = new Map<string, number>();

  function handleCloseRequest() {
    if (isSubmitting) {
      return;
    }

    onClose();
  }

  function handleDialogClose(_: object, reason: "backdropClick" | "escapeKeyDown") {
    if (isSubmitting) {
      return;
    }

    if (reason === "backdropClick") {
      return;
    }

    onClose();
  }

  function handleChange(field: keyof CreateTaskDto) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onFieldChange(field, event.target.value);
    };
  }

  function handleAddSubtask() {
    const trimmed = subtaskInput.trim();
    if (!trimmed) return;
    onSubtaskAdd(trimmed);
    setSubtaskInput("");
    subtaskInputRef.current?.focus();
  }

  function handleSubtaskInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddSubtask();
    }
  }

  return (
    <Dialog
      aria-labelledby={titleId}
      fullWidth
      maxWidth="sm"
      open={isOpen}
      slotProps={{ paper: { className: "app-dialog task-modal" } }}
      onClose={handleDialogClose}
    >
      <form className="task-modal__form" onSubmit={onSubmit}>
        <DialogTitle
          className="app-dialog__title app-dialog__title--split"
          id={titleId}
        >
          <span>{modalTitle}</span>
          <IconButton
            aria-label={closeLabel}
            className="app-dialog__close-button"
            disabled={isSubmitting}
            onClick={handleCloseRequest}
          >
            <img src={closeIcon} alt="" width="24" height="24" />
          </IconButton>
        </DialogTitle>

        <DialogContent className="app-dialog__content app-dialog__content--form">
          <div className="task-modal__fields">
            <TextField
              autoFocus
              disabled={isSubmitting}
              error={Boolean(fieldErrors.title)}
              helperText={fieldErrors.title}
              label={t("common.title")}
              type="text"
              value={formValues.title}
              onChange={handleChange("title")}
            />
            <TextField
              disabled={isSubmitting}
              error={Boolean(fieldErrors.description)}
              helperText={fieldErrors.description}
              label={t("common.descriptionOptional")}
              minRows={4}
              multiline
              value={formValues.description}
              onChange={handleChange("description")}
            />

            <div className="task-modal__split-fields">
              <TextField
                disabled={isSubmitting}
                error={Boolean(fieldErrors.priority)}
                fullWidth
                helperText={fieldErrors.priority}
                id="create-task-priority"
                label={t("common.priority")}
                select
                value={formValues.priority}
                onChange={(event) =>
                  onFieldChange("priority", event.target.value as CreateTaskDto["priority"])
                }
              >
                {priorityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                disabled={isSubmitting}
                error={Boolean(fieldErrors.dueDate)}
                fullWidth
                helperText={fieldErrors.dueDate}
                id="create-task-due-date"
                label={t("common.dueDateOptional")}
                type="date"
                value={formValues.dueDate}
                onChange={handleChange("dueDate")}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
              />
            </div>

            <TextField
              disabled={isSubmitting}
              error={Boolean(fieldErrors.tag)}
              helperText={fieldErrors.tag}
              label={t("common.tagOptional")}
              type="text"
              value={formValues.tag}
              onChange={handleChange("tag")}
            />

            <div className="task-modal__split-fields">
              <TextField
                disabled={isSubmitting}
                error={Boolean(fieldErrors.recurrence)}
                fullWidth
                helperText={fieldErrors.recurrence ?? t("tasks.modal.recurrenceHint")}
                id="create-task-recurrence"
                label={t("tasks.modal.recurrenceLabel")}
                select
                value={recurrenceValue}
                onChange={(event) =>
                  onFieldChange("recurrence", event.target.value as Recurrence)
                }
              >
                {recurrenceOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                disabled={isSubmitting || !isRecurring}
                error={Boolean(fieldErrors.recurrenceEndDate)}
                fullWidth
                helperText={
                  fieldErrors.recurrenceEndDate ?? t("tasks.modal.recurrenceEndHint")
                }
                id="create-task-recurrence-end-date"
                label={t("tasks.modal.recurrenceEndLabel")}
                type="date"
                value={isRecurring ? formValues.recurrenceEndDate : ""}
                onChange={handleChange("recurrenceEndDate")}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                  htmlInput: {
                    min: recurrenceEndMinDate,
                  },
                }}
              />
            </div>

            <div className="task-modal__subtasks">
              <div className="task-modal__subtasks-label">{t("tasks.modal.subtasks")}</div>
              <div className="task-modal__subtasks-input">
                <TextField
                  inputRef={subtaskInputRef}
                  disabled={isSubmitting}
                  label={t("tasks.modal.addSubtask")}
                  size="small"
                  fullWidth
                  value={subtaskInput}
                  onChange={(e) => setSubtaskInput(e.target.value)}
                  onKeyDown={handleSubtaskInputKeyDown}
                  slotProps={{ htmlInput: { maxLength: 200 } }}
                />
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  className="task-modal__subtask-add"
                  disabled={isSubmitting || !subtaskInput.trim()}
                  onClick={handleAddSubtask}
                >
                  {t("common.add")}
                </Button>
              </div>

              {subtasks.length > 0 && (
                <ul className="task-modal__subtask-list">
                  {subtasks.map((title, index) => {
                    const titleOccurrence = (subtaskTitleCounts.get(title) ?? 0) + 1;
                    subtaskTitleCounts.set(title, titleOccurrence);
                    const subtaskKey = `${subtaskKeyPrefix}-${title}-${titleOccurrence}`;

                    return (
                      <li className="task-modal__subtask-item" key={subtaskKey}>
                        <span className="task-modal__subtask-title">{title}</span>
                        <IconButton
                          className="task-modal__subtask-remove"
                          size="small"
                          disabled={isSubmitting}
                          onClick={() => onSubtaskRemove(index)}
                          aria-label={t("tasks.modal.removeSubtask", { title })}
                        >
                          <img src={closeIcon} alt="" width="16" height="16" />
                        </IconButton>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {formError ? <Alert severity="error">{formError}</Alert> : null}
          </div>
        </DialogContent>

        <DialogActions className="app-dialog__actions">
          <Button disabled={isSubmitting} onClick={handleCloseRequest}>
            {t("common.cancel")}
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {submitLabel}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default CreateTaskModal;
