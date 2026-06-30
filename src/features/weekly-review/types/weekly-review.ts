export const WEEKLY_REVIEW_CATEGORIES = [
  "tshirt",
  "shirt",
  "knit",
  "hoodie",
  "vest",
  "cardigan",
  "pants",
  "shorts",
  "skirt",
  "dress",
  "jacket",
  "coat",
  "padding",
] as const;

export type WeeklyReviewCategory = (typeof WEEKLY_REVIEW_CATEGORIES)[number];

export type WeeklyReviewCategoryLabel =
  | "T-Shirt"
  | "Shirt"
  | "Knit"
  | "Hoodie"
  | "Vest"
  | "Cardigan"
  | "Pants"
  | "Shorts"
  | "Skirt"
  | "Dress"
  | "Jacket"
  | "Coat"
  | "Padding";

export type WeeklyReviewClothes = {
  clothesId: number;
  imageUrl: string;
  color: string;
  category: WeeklyReviewCategory;
  categoryLabel: WeeklyReviewCategoryLabel;
};

export type DailyReviewSelectionClothes = WeeklyReviewClothes & {
  selected: boolean;
};

export type DailyReviewSelectionCategory = {
  category: WeeklyReviewCategory;
  categoryLabel: WeeklyReviewCategoryLabel;
  selectedCount: number;
  clothes: DailyReviewSelectionClothes[];
};

export type DailyReviewSelection = {
  reviewDate: string;
  weekStartDate: string;
  weekEndDate: string;
  completed: boolean;
  previousDayIncomplete: boolean;
  noRegisteredClothes: boolean;
  categories: DailyReviewSelectionCategory[];
};

export type WeeklyReviewResultCategory = {
  category: WeeklyReviewCategory;
  categoryLabel: WeeklyReviewCategoryLabel;
  wornCount: number;
  clothes: WeeklyReviewClothes[];
};

export type WeeklyReviewResult = {
  weekStartDate: string;
  weekEndDate: string;
  wornClothesCount: number;
  totalClothesCount?: number;
  weeklyClosetUsageRate: number;
  weeklyInsight: string;
  categories: WeeklyReviewResultCategory[];
};

export type ClosetUsageType = "neglected" | "potential" | "active" | "master";

export type ClosetUsageRange = {
  min: number;
  max: number;
};

export type ClosetUsageProfile = {
  type: ClosetUsageType;
  title: "방치형 옷장" | "잠재형 옷장" | "활용형 옷장" | "마스터형 옷장";
  shortTitle: "방치형" | "잠재형" | "활용형" | "마스터형";
  range: ClosetUsageRange;
  colorToken: "red" | "yellow" | "green" | "blue";
};

export type WeeklyReceiptReportItem = {
  clothesId: number;
  imageUrl: string;
  color: string;
  category: WeeklyReviewCategory;
  categoryLabel: WeeklyReviewCategoryLabel;
  price: number;
};

export type WeeklyReceiptReport = {
  weekStartDate: string;
  weekEndDate: string;
  usageRate: number;
  usageProfile: ClosetUsageProfile;
  wornItems: WeeklyReceiptReportItem[];
  totalPrice: number;
};
