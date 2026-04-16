import type { Recurrence, TaskDto } from "../../../shared/types";
import { parseIsoDate, toIsoDate } from "./calendarDate";

const MAX_OCCURRENCES_PER_RANGE = 400;

function advanceOccurrence(isoDate: string, recurrence: Recurrence): string | null {
  const parts = parseIsoDate(isoDate);
  if (!parts) {
    return null;
  }

  const date = new Date(parts.year, parts.month - 1, parts.day);

  if (recurrence === "daily") {
    date.setDate(date.getDate() + 1);
  } else if (recurrence === "weekly") {
    date.setDate(date.getDate() + 7);
  } else if (recurrence === "monthly") {
    date.setMonth(date.getMonth() + 1);
  } else {
    return null;
  }

  return toIsoDate({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });
}

export function getTaskOccurrencesInRange(
  task: TaskDto,
  rangeStartIso: string,
  rangeEndIso: string,
): string[] {
  if (!task.dueDate) {
    return [];
  }

  const recurrence = task.recurrence ?? "none";
  const hasRecurrenceEnd = Boolean(task.recurrenceEndDate);
  const recurrenceEndsBeforeRange =
    hasRecurrenceEnd && task.recurrenceEndDate < rangeEndIso;
  const endCap = recurrenceEndsBeforeRange ? task.recurrenceEndDate : rangeEndIso;

  const dueDateIsWithinRange =
    task.dueDate >= rangeStartIso && task.dueDate <= endCap;

  if (recurrence === "none" || task.completed) {
    return dueDateIsWithinRange ? [task.dueDate] : [];
  }

  const occurrences: string[] = [];
  let current: string | null = task.dueDate;
  let safety = 0;

  while (current && current <= endCap && safety < MAX_OCCURRENCES_PER_RANGE) {
    if (current >= rangeStartIso) {
      occurrences.push(current);
    }
    current = advanceOccurrence(current, recurrence);
    safety += 1;
  }

  return occurrences;
}
