export const onboardingQueryKeys = {
  all: ["onboarding"] as const,
  status: () => [...onboardingQueryKeys.all, "status"] as const,
  quests: () => [...onboardingQueryKeys.all, "quests"] as const,
};
