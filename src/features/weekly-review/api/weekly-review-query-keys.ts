export const weeklyReviewQueryKeys = {
  all: ["weekly-review"] as const,
  member: (memberId: number) => [...weeklyReviewQueryKeys.all, "member", memberId] as const,
  dailyReviews: (memberId: number) =>
    [...weeklyReviewQueryKeys.member(memberId), "daily-reviews"] as const,
  dailyReviewToday: (memberId: number) =>
    [...weeklyReviewQueryKeys.dailyReviews(memberId), "today"] as const,
  weeklyReviews: (memberId: number) =>
    [...weeklyReviewQueryKeys.member(memberId), "weekly-reviews"] as const,
  currentWeeklyReview: (memberId: number) =>
    [...weeklyReviewQueryKeys.weeklyReviews(memberId), "current"] as const,
  weeklyReviewByStartDate: (memberId: number, weekStartDate: string) =>
    [...weeklyReviewQueryKeys.weeklyReviews(memberId), weekStartDate] as const,
  weeklyClosetUsage: (memberId: number) =>
    [...weeklyReviewQueryKeys.member(memberId), "weekly-closet-usage"] as const,
  weeklyClosetUsageAnalysis: (memberId: number) =>
    [...weeklyReviewQueryKeys.weeklyClosetUsage(memberId), "analysis"] as const,
  weeklyWornClothes: (memberId: number) =>
    [...weeklyReviewQueryKeys.weeklyClosetUsage(memberId), "worn-clothes"] as const,
};
