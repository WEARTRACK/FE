const MINUTE_IN_MS = 60 * 1000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function formatNotificationTime(sentAt: string, now: Date = new Date()) {
  const sentDate = new Date(sentAt);
  const sentTime = sentDate.getTime();

  if (Number.isNaN(sentTime)) {
    return "";
  }

  const diff = Math.max(0, now.getTime() - sentTime);

  if (diff < MINUTE_IN_MS) {
    return "방금 전";
  }

  if (diff < HOUR_IN_MS) {
    return `${Math.floor(diff / MINUTE_IN_MS)}분 전`;
  }

  if (diff < DAY_IN_MS) {
    return `${Math.floor(diff / HOUR_IN_MS)}시간 전`;
  }

  if (diff < 7 * DAY_IN_MS) {
    return `${Math.floor(diff / DAY_IN_MS)}일 전`;
  }

  return `${sentDate.getFullYear()}.${pad(sentDate.getMonth() + 1)}.${pad(sentDate.getDate())}`;
}
