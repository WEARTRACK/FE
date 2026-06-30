import type { ClosetUsageProfile } from "@/features/weekly-review/types/weekly-review";

const mockPricesByType: Record<ClosetUsageProfile["type"], number[]> = {
  master: [49000, 45200, 40000],
  active: [49000, 37200, 42000, 38000],
  potential: [39000, 42000, 45500, 32900, 37300],
  neglected: [69000, 58000, 53000, 62000, 74500, 48000, 71500, 72000],
};

export function getMockReceiptPrice(profile: ClosetUsageProfile, index: number) {
  const prices = mockPricesByType[profile.type];

  return prices[index % prices.length];
}
