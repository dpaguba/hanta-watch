import { describe, expect, it } from "vitest";

import { formatNumber, freshnessClass, relativeTime } from "./format";

describe("formatNumber", () => {
  it("inserts thousands separators", () => {
    expect(formatNumber(1234567)).toBe("1,234,567");
  });
});

describe("relativeTime", () => {
  const now = new Date("2026-05-13T12:00:00Z");
  it("handles seconds", () => {
    expect(relativeTime("2026-05-13T11:59:30Z", now)).toBe("30s ago");
  });
  it("handles minutes", () => {
    expect(relativeTime("2026-05-13T11:30:00Z", now)).toBe("30m ago");
  });
  it("handles hours", () => {
    expect(relativeTime("2026-05-13T09:00:00Z", now)).toBe("3h ago");
  });
  it("handles days", () => {
    expect(relativeTime("2026-05-10T12:00:00Z", now)).toBe("3d ago");
  });
});

describe("freshnessClass", () => {
  const now = new Date("2026-05-13T12:00:00Z");
  it("fresh under 4h", () => {
    expect(freshnessClass("2026-05-13T10:00:00Z", now)).toBe("ok");
  });
  it("stale between 4h and 24h", () => {
    expect(freshnessClass("2026-05-13T05:00:00Z", now)).toBe("stale");
  });
  it("err over 24h", () => {
    expect(freshnessClass("2026-05-11T00:00:00Z", now)).toBe("err");
  });
});
