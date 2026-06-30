import type {
  ClosetUsageProfile,
  ClosetUsageType,
} from "@/features/weekly-review/types/weekly-review";

export const CLOSET_USAGE_PROFILES: Record<ClosetUsageType, ClosetUsageProfile> = {
  neglected: {
    type: "neglected",
    title: "방치형 옷장",
    shortTitle: "방치형",
    range: { min: 0, max: 20 },
    colorToken: "red",
  },
  potential: {
    type: "potential",
    title: "잠재형 옷장",
    shortTitle: "잠재형",
    range: { min: 21, max: 50 },
    colorToken: "yellow",
  },
  active: {
    type: "active",
    title: "활용형 옷장",
    shortTitle: "활용형",
    range: { min: 51, max: 80 },
    colorToken: "green",
  },
  master: {
    type: "master",
    title: "마스터형 옷장",
    shortTitle: "마스터형",
    range: { min: 81, max: 100 },
    colorToken: "blue",
  },
};

export function clampClosetUsageRate(rate: number) {
  if (!Number.isFinite(rate)) {
    return 0;
  }

  return Math.min(Math.max(Math.round(rate), 0), 100);
}

export function getClosetUsageType(rate: number): ClosetUsageType {
  const clampedRate = clampClosetUsageRate(rate);

  if (clampedRate <= 20) {
    return "neglected";
  }

  if (clampedRate <= 50) {
    return "potential";
  }

  if (clampedRate <= 80) {
    return "active";
  }

  return "master";
}

export function getClosetUsageProfile(rate: number): ClosetUsageProfile {
  return CLOSET_USAGE_PROFILES[getClosetUsageType(rate)];
}
