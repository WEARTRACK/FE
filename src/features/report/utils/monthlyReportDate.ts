function padMonth(month: number) {
  return String(month).padStart(2, "0");
}

export function getCurrentYearMonth(today = new Date()) {
  return `${today.getFullYear()}-${padMonth(today.getMonth() + 1)}`;
}

export function shiftYearMonth(yearMonth: string, months: number) {
  const [year, month] = yearMonth.split("-").map(Number);
  const date = new Date(year, month - 1 + months, 1);

  return `${date.getFullYear()}-${padMonth(date.getMonth() + 1)}`;
}

export function getMonthDistance(fromYearMonth: string, toYearMonth: string) {
  const [fromYear, fromMonth] = fromYearMonth.split("-").map(Number);
  const [toYear, toMonth] = toYearMonth.split("-").map(Number);

  return (fromYear - toYear) * 12 + fromMonth - toMonth;
}
