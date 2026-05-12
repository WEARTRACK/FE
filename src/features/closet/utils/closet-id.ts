export function isValidClosetId(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

export function parseClosetId(value: unknown): number | null {
  if (typeof value === "string") {
    const parsed = Number(value);
    return isValidClosetId(parsed) ? parsed : null;
  }

  return isValidClosetId(value) ? value : null;
}
