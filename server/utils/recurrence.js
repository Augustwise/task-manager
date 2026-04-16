const MS_PER_DAY = 24 * 60 * 60 * 1000;

function parseIsoDate(value) {
  if (typeof value !== "string") {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }

  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);

  return { year, month, day };
}

function formatIsoDate(parts) {
  const pad = (value) => value.toString().padStart(2, "0");
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

function getNextOccurrence(currentDueDate, recurrence) {
  const parts = parseIsoDate(currentDueDate);
  if (!parts) {
    return null;
  }

  const base = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  const today = new Date();
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  // Start from at least today, then advance by the recurrence interval at least once
  let next = base;

  function advance(date) {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();

    if (recurrence === "daily") {
      return new Date(date.getTime() + MS_PER_DAY);
    }
    if (recurrence === "weekly") {
      return new Date(date.getTime() + 7 * MS_PER_DAY);
    }
    if (recurrence === "monthly") {
      return new Date(Date.UTC(year, month + 1, day));
    }

    return date;
  }

  // Always advance at least once past the current due date.
  next = advance(next);

  // If the new occurrence is still in the past (e.g., task was overdue by multiple cycles), keep advancing until it is today or later.
  while (next.getTime() < todayUtc.getTime()) {
    next = advance(next);
  }

  return formatIsoDate({
    year: next.getUTCFullYear(),
    month: next.getUTCMonth() + 1,
    day: next.getUTCDate(),
  });
}

module.exports = { getNextOccurrence };
