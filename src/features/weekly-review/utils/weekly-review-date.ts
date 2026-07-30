export type WeeklyReviewWeekLabel = {
  month: number;
  weekOfMonth: number;
  label: string;
};

function parseDateOnly(date: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, monthIndex, day));

  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== monthIndex ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  return parsed;
}

export function getWeeklyReviewWeekLabel(weekStartDate: string): WeeklyReviewWeekLabel {
  const parsed = parseDateOnly(weekStartDate);

  if (!parsed) {
    return {
      month: 0,
      weekOfMonth: 0,
      label: "",
    };
  }

  const month = parsed.getUTCMonth() + 1;
  const day = parsed.getUTCDate();
  const firstDayOfMonth = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), 1));
  const firstDayOffset = firstDayOfMonth.getUTCDay();
  const calendarWeekOfMonth = Math.floor((day + firstDayOffset - 1) / 7) + 1;
  const startsInFirstPartialWeek = day <= 7;
  const shouldShiftAfterFirstWeek = firstDayOffset > 1 && firstDayOffset < 6;
  const weekOfMonth = startsInFirstPartialWeek
    ? 1
    : calendarWeekOfMonth - (shouldShiftAfterFirstWeek ? 1 : 0);

  return {
    month,
    weekOfMonth,
    label: `${month}월 ${weekOfMonth}주차`,
  };
}

export function formatWeeklyReviewDateRange(weekStartDate: string, weekEndDate: string) {
  const startDate = parseDateOnly(weekStartDate);
  const endDate = parseDateOnly(weekEndDate);

  if (!startDate || !endDate) {
    return "";
  }

  const startMonth = startDate.getUTCMonth() + 1;
  const endMonth = endDate.getUTCMonth() + 1;
  const startDay = startDate.getUTCDate();
  const endDay = endDate.getUTCDate();

  if (startMonth !== endMonth) {
    return `${startMonth}/${startDay}-${endMonth}/${endDay}`;
  }

  return `${startMonth}/${startDay}-${endDay}`;
}
