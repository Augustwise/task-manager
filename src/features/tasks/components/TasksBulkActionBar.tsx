import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Slide,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useI18n } from "../../../shared/i18n/useI18n";
import type { Priority } from "../../../shared/types";
import type { TasksBulkActionBarProps } from "../types/components";

function TasksBulkActionBar({
  selectedCount,
  selectedTasks,
  canUpdateCompletion,
  isPending,
  showRestoreAction,
  completionAction,
  onUpdateCompletion,
  onRestore,
  onDelete,
  onClearSelection,
  onApplyPriority,
}: TasksBulkActionBarProps) {
  const { t } = useI18n();
  const [priority, setPriority] = useState<Priority | "">("");

  const prevSelectedCount = useRef(selectedCount);
  useEffect(() => {
    if (prevSelectedCount.current !== selectedCount && selectedCount === 0) {
      const id = setTimeout(() => setPriority(""), 0);
      return () => clearTimeout(id);
    }
    prevSelectedCount.current = selectedCount;
  }, [selectedCount]);
  const canApplyPriority =
    priority !== "" && selectedTasks.some((task) => task.priority !== priority);

  async function handlePriorityApply() {
    if (priority === "" || !canApplyPriority) {
      return;
    }

    const didApply = await onApplyPriority(priority);

    if (didApply) {
      setPriority("");
    }
  }

  return (
    <Slide direction="up" in={selectedCount > 0} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: "fixed",
          bottom: { xs: 16, sm: 24 },
          insetInline: 0,
          zIndex: (theme) => theme.zIndex.appBar,
          display: "flex",
          justifyContent: "center",
          px: { xs: 1.5, sm: 2 },
          pointerEvents: "none",
        }}
      >
        <Paper
          elevation={12}
          sx={{
            width: "min(100%, 980px)",
            borderRadius: 3,
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1.5, sm: 1.25 },
            boxShadow: "0 20px 45px rgba(15, 23, 42, 0.18)",
            pointerEvents: "auto",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 1.5, md: 2 }}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, minWidth: { md: 120 } }}
            >
              {t("tasks.bulk.selectedCount", { count: selectedCount })}
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", sm: "center" }}
              sx={{ flex: 1 }}
            >
              {showRestoreAction ? (
                <Button
                  variant="contained"
                  disabled={isPending}
                  onClick={() => {
                    void onRestore();
                  }}
                >
                  {t("tasks.bulk.restore")}
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    disabled={isPending || !canUpdateCompletion}
                    onClick={() => {
                      void onUpdateCompletion();
                    }}
                  >
                    {completionAction === "activate"
                      ? t("tasks.bulk.activate")
                      : t("tasks.bulk.complete")}
                  </Button>
                  <Button
                    color="error"
                    variant="outlined"
                    disabled={isPending}
                    onClick={onDelete}
                  >
                    {t("tasks.bulk.delete")}
                  </Button>
                  <TextField
                    select
                    size="small"
                    label={t("tasks.bulk.priority")}
                    value={priority}
                    disabled={isPending}
                    onChange={(event) => setPriority(event.target.value as Priority | "")}
                    sx={{ minWidth: { sm: 170 } }}
                  >
                    <MenuItem disabled value="">
                      {t("tasks.bulk.choosePriority")}
                    </MenuItem>
                    <MenuItem value="high">{t("common.priorityLevels.high")}</MenuItem>
                    <MenuItem value="medium">{t("common.priorityLevels.medium")}</MenuItem>
                    <MenuItem value="low">{t("common.priorityLevels.low")}</MenuItem>
                  </TextField>
                  <Button
                    variant="outlined"
                    disabled={isPending || !canApplyPriority}
                    onClick={() => {
                      void handlePriorityApply();
                    }}
                  >
                    {t("tasks.bulk.applyPriority")}
                  </Button>
                </>
              )}
            </Stack>

            <Button
              variant="text"
              disabled={isPending}
              onClick={onClearSelection}
              sx={{ alignSelf: { xs: "stretch", md: "center" } }}
            >
              {t("tasks.bulk.clearSelection")}
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Slide>
  );
}

export default TasksBulkActionBar;
