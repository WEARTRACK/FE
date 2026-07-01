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

export function getWeekDistance(fromDateString: string, toDateString: string) {
  const [fromYear, fromMonth, fromDay] = fromDateString.split("-").map(Number);
  const [toYear, toMonth, toDay] = toDateString.split("-").map(Number);
  const fromTime = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const toTime = Date.UTC(toYear, toMonth - 1, toDay);
  const distance = (fromTime - toTime) / (7 * 24 * 60 * 60 * 1000);

  return Number.isInteger(distance) ? distance : null;
}
