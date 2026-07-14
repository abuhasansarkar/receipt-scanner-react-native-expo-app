import { computeWeeklyInsights, computeMonthlyInsights } from "../features/insights/service";
import type { Receipt } from "../types/receipt";

describe("Insights Computations", () => {
  const mockReceipts: Receipt[] = [
    {
      id: "1",
      merchant: "Cafe",
      total: 10.0,
      currency: "USD",
      date: "2026-07-14T10:00:00.000Z",
      category: "food",
      status: "verified",
      source: "camera",
      createdAt: "2026-07-14T10:00:00.000Z",
      updatedAt: "2026-07-14T10:00:00.000Z",
    },
  ];

  it("calculates weekly insights schema structure", () => {
    const anchor = new Date("2026-07-14T12:00:00.000Z");
    const insights = computeWeeklyInsights(mockReceipts, anchor);

    expect(insights).toHaveProperty("weekTotal");
    expect(insights).toHaveProperty("categoryBreakdown");
    expect(insights).toHaveProperty("alerts");
  });

  it("calculates monthly insights schema structure", () => {
    const anchor = new Date("2026-07-14T12:00:00.000Z");
    const insights = computeMonthlyInsights(mockReceipts, anchor);

    expect(insights).toHaveProperty("monthTotal");
    expect(insights).toHaveProperty("projectedTotal");
    expect(insights).toHaveProperty("dailyAverage");
  });
});
