import { InputAdornment, MenuItem, TextField } from "@mui/material";
import searchIcon from "../../../assets/icon-search.svg";
import { useI18n } from "../../../shared/i18n/useI18n";
import type {
  PriorityFilter,
  SortOption,
  StatusFilter,
} from "../types/model";
import type { TasksToolbarProps } from "../types/components";

function TasksToolbar({
  searchQuery,
  sortBy,
  priorityFilter,
  statusFilter,
  onCreateTaskClick,
  onSearchQueryChange,
  onSortByChange,
  onPriorityFilterChange,
  onStatusFilterChange,
}: TasksToolbarProps) {
  const { t } = useI18n();
  const sortOptions = [
    { value: "due-date", label: t("tasks.toolbar.sortOptions.dueDate") },
    { value: "priority", label: t("tasks.toolbar.sortOptions.priority") },
    { value: "created", label: t("tasks.toolbar.sortOptions.created") },
  ] satisfies ReadonlyArray<{ label: string; value: SortOption }>;
  const priorityOptions = [
    { value: "all", label: t("common.all") },
    { value: "high", label: t("common.priorityLevels.high") },
    { value: "medium", label: t("common.priorityLevels.medium") },
    { value: "low", label: t("common.priorityLevels.low") },
  ] satisfies ReadonlyArray<{ label: string; value: PriorityFilter }>;
  const statusOptions = [
    { value: "all", label: t("common.all") },
    { value: "active", label: t("common.active") },
    { value: "completed", label: t("common.completed") },
    { value: "deleted", label: t("common.deleted") },
  ] satisfies ReadonlyArray<{ label: string; value: StatusFilter }>;

  return (
    <div className="tasks-page__toolbar">
      <div className="tasks-page__search-wrapper">
        <TextField
          fullWidth
          id="tasks-search"
          label={t("common.search")}
          size="small"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <img src={searchIcon} alt="" width="15" height="15" />
                </InputAdornment>
              ),
            },
          }}
        />
      </div>

      <div className="tasks-page__select-group tasks-page__select-group--sort">
        <TextField
          className="tasks-page__select-control"
          fullWidth
          id="tasks-sort-select"
          label={t("common.sort")}
          select
          size="small"
          value={sortBy}
          onChange={(event) => onSortByChange(event.target.value as SortOption)}
        >
          {sortOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </div>

      <div className="tasks-page__select-group tasks-page__select-group--priority">
        <TextField
          className="tasks-page__select-control"
          fullWidth
          id="tasks-priority-select"
          label={t("common.priority")}
          select
          size="small"
          value={priorityFilter}
          onChange={(event) => onPriorityFilterChange(event.target.value as PriorityFilter)}
        >
          {priorityOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </div>

      <div className="tasks-page__select-group tasks-page__select-group--status">
        <TextField
          className="tasks-page__select-control"
          fullWidth
          id="tasks-status-select"
          label={t("common.status")}
          select
          size="small"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as StatusFilter)}
        >
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </div>

      <button type="button" className="tasks-page__new-task-btn" onClick={onCreateTaskClick}>
        {t("tasks.toolbar.newTask")}
      </button>
    </div>
  );
}

export default TasksToolbar;
