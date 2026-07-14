import { parseScanResult } from "../lib/scan-parser";

describe("parseScanResult", () => {
  it("parses valid JSON response correctly", () => {
    const raw = JSON.stringify({
      merchant: "Test Merchant",
      total: 100.5,
      currency: "USD",
      date: "2026-07-14T00:00:00.000Z",
      category: "office",
      items: [{ name: "Pen", price: 100.5, quantity: 1 }],
      confidence: {
        merchant: 0.9,
        total: 0.95,
        date: 0.8,
        category: 0.85,
        currency: 0.9,
        items: 0.8,
      },
    });

    const parsed = parseScanResult(raw, "TestProvider");

    expect(parsed.merchant).toBe("Test Merchant");
    expect(parsed.total).toBe(100.5);
    expect(parsed.currency).toBe("USD");
    expect(parsed.category).toBe("office");
    expect(parsed.items).toHaveLength(1);
    expect(parsed.items[0].name).toBe("Pen");
    expect(parsed.confidence.merchant).toBe(0.9);
  });

  it("handles and cleans markdown code fences", () => {
    const raw = `\`\`\`json
    {
      "merchant": "Markdown Store",
      "total": 45.0,
      "currency": "EUR",
      "date": "2026-07-14T00:00:00.000Z",
      "category": "food",
      "items": [{ "name": "Meal", "price": 45.0, "quantity": 1 }]
    }
    \`\`\``;

    const parsed = parseScanResult(raw, "TestProvider");
    expect(parsed.merchant).toBe("Markdown Store");
    expect(parsed.total).toBe(45.0);
    expect(parsed.currency).toBe("EUR");
  });

  it("falls back to item sum if total is missing or zero", () => {
    const raw = JSON.stringify({
      merchant: "Sum Fallback Store",
      currency: "GBP",
      date: "2026-07-14T00:00:00.000Z",
      category: "travel",
      items: [
        { name: "Ticket 1", price: 20.0, quantity: 1 },
        { name: "Ticket 2", price: 15.0, quantity: 2 },
      ],
    });

    const parsed = parseScanResult(raw, "TestProvider");
    expect(parsed.total).toBe(50.0); // 20 + (15 * 2)
  });
});
