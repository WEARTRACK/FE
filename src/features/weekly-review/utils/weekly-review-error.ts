import { ApiError } from "@/lib/api/errors";

export function isWeeklyReviewNotFoundError(error: unknown) {
  return error instanceof ApiError && (error.status === 404 || error.code === "WEEKLY_REVIEW_404");
}
