export type ReportProduct = {
  id: string;
  name: string;
  brand: string;
  price: number;
};

export type ReportCategory = {
  label: string;
  amount: number;
  products: ReportProduct[];
};

export type WeeklyReport = {
  id: string;
  startDate: string;
  endDate: string;
  total: number;
  comparison?: string;
  categories: ReportCategory[];
};

export type MonthlyTopCategory = {
  label: string;
  percentage: number;
};

export type MonthlyReport = {
  id: string;
  monthDate: string;
  total: number;
  comparison?: string;
  topCategories: MonthlyTopCategory[];
};

const categoryLabels = [
  "T-Shirt",
  "Shirt",
  "Hoodie",
  "Vest",
  "Cardigan",
  "Pants",
  "Shorts",
  "Skirt",
  "Dress",
  "Jacket",
  "Coat",
  "Padding",
] as const;

function createCategories(
  spending: Partial<Record<(typeof categoryLabels)[number], ReportCategory>>,
): ReportCategory[] {
  return categoryLabels.map(
    (label) =>
      spending[label] ?? {
        label,
        amount: 0,
        products: [],
      },
  );
}

const stripeShirt: ReportProduct = {
  id: "stripe-shirt",
  name: "스트라이프 셔츠",
  brand: "무신사 스탠다드",
  price: 40_000,
};

const checkShirt: ReportProduct = {
  id: "check-shirt",
  name: "체크 셔츠",
  brand: "블랙업",
  price: 13_000,
};

const graphicTShirt: ReportProduct = {
  id: "graphic-tshirt",
  name: "그래픽 티셔츠",
  brand: "웨어트랙",
  price: 89_000,
};

export const weeklyReports: WeeklyReport[] = [
  {
    id: "this-week",
    startDate: "2026-05-25",
    endDate: "2026-05-31",
    total: 89_000,
    comparison: "1주 전 대비 -23%",
    categories: createCategories({
      "T-Shirt": {
        label: "T-Shirt",
        amount: 89_000,
        products: [graphicTShirt],
      },
    }),
  },
  {
    id: "one-week-ago",
    startDate: "2026-05-18",
    endDate: "2026-05-24",
    total: 82_000,
    categories: createCategories({
      "T-Shirt": {
        label: "T-Shirt",
        amount: 29_000,
        products: [
          {
            id: "basic-tshirt",
            name: "베이직 티셔츠",
            brand: "웨어트랙",
            price: 29_000,
          },
        ],
      },
      Shirt: {
        label: "Shirt",
        amount: 53_000,
        products: [stripeShirt, checkShirt],
      },
    }),
  },
  {
    id: "two-weeks-ago",
    startDate: "2026-05-11",
    endDate: "2026-05-17",
    total: 82_000,
    categories: createCategories({
      "T-Shirt": {
        label: "T-Shirt",
        amount: 29_000,
        products: [
          {
            id: "logo-tshirt",
            name: "로고 티셔츠",
            brand: "웨어트랙",
            price: 29_000,
          },
        ],
      },
      Shirt: {
        label: "Shirt",
        amount: 53_000,
        products: [stripeShirt, checkShirt],
      },
    }),
  },
  {
    id: "three-weeks-ago",
    startDate: "2026-05-04",
    endDate: "2026-05-10",
    total: 82_000,
    categories: createCategories({
      "T-Shirt": {
        label: "T-Shirt",
        amount: 29_000,
        products: [
          {
            id: "daily-tshirt",
            name: "데일리 티셔츠",
            brand: "웨어트랙",
            price: 29_000,
          },
        ],
      },
      Shirt: {
        label: "Shirt",
        amount: 53_000,
        products: [stripeShirt, checkShirt],
      },
    }),
  },
];

const defaultMonthlyTopCategories: MonthlyTopCategory[] = [
  { label: "Pants", percentage: 45 },
  { label: "Skirt", percentage: 30 },
  { label: "Jacket", percentage: 25 },
];

export const monthlyReports: MonthlyReport[] = [
  {
    id: "this-month",
    monthDate: "2026-05-01",
    total: 240_000,
    comparison: "1달 전 대비 +20%",
    topCategories: defaultMonthlyTopCategories,
  },
  {
    id: "one-month-ago",
    monthDate: "2026-04-01",
    total: 130_000,
    topCategories: defaultMonthlyTopCategories,
  },
  {
    id: "two-months-ago",
    monthDate: "2026-03-01",
    total: 220_000,
    topCategories: defaultMonthlyTopCategories,
  },
  {
    id: "three-months-ago",
    monthDate: "2026-02-01",
    total: 250_000,
    topCategories: defaultMonthlyTopCategories,
  },
];

export function getWeeklyReport(reportId: string | undefined) {
  return weeklyReports.find((report) => report.id === reportId) ?? weeklyReports[0];
}
