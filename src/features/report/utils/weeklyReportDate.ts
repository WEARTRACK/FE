function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function formatLocalDate(date: Date) {
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

export function shiftDate(dateString: string, days: number) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  date.setDate(date.getDate() + days);

  return formatLocalDate(date);
}

export function getCurrentWeekStartDate(today = new Date()) {
  const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  return formatLocalDate(weekStart);
}
