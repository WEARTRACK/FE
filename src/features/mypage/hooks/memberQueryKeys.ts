export const memberQueryKeys = {
  all: ["member"] as const,
  detail: (memberId: number) => [...memberQueryKeys.all, "detail", memberId] as const,
};
