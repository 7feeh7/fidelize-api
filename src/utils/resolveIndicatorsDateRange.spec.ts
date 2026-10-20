import { describe, expect, it } from "vitest";
import {
	getCurrentMonthDateRange,
	getEarliestIndicatorsDate,
	resolveIndicatorsDateRange,
} from "./resolveIndicatorsDateRange";

describe("resolveIndicatorsDateRange", () => {
	it("defaults to the current month until today", () => {
		expect(
			resolveIndicatorsDateRange({}, "2026-10-15"),
		).toEqual({
			startDate: "2026-10-01",
			endDate: "2026-10-15",
		});
	});

	it("accepts a custom range within 12 months", () => {
		expect(
			resolveIndicatorsDateRange(
				{ startDate: "2026-01-01", endDate: "2026-10-15" },
				"2026-10-15",
			),
		).toEqual({
			startDate: "2026-01-01",
			endDate: "2026-10-15",
		});
	});

	it("rejects ranges longer than 12 months", () => {
		expect(() =>
			resolveIndicatorsDateRange(
				{ startDate: "2025-01-01", endDate: "2026-01-31" },
				"2026-10-15",
			),
		).toThrow("O período não pode ser maior que 12 meses");
	});

	it("rejects periods older than the last 12 months", () => {
		expect(() =>
			resolveIndicatorsDateRange(
				{ startDate: "2025-09-01", endDate: "2025-09-30" },
				"2026-10-15",
			),
		).toThrow("O período deve estar dentro dos últimos 12 meses");
	});
});

describe("getCurrentMonthDateRange", () => {
	it("returns month bounds", () => {
		expect(getCurrentMonthDateRange("2026-02-10")).toEqual({
			startDate: "2026-02-01",
			endDate: "2026-02-10",
		});
	});
});

describe("getEarliestIndicatorsDate", () => {
	it("returns the first day 11 months before the reference month", () => {
		expect(getEarliestIndicatorsDate("2026-10-15")).toBe("2025-11-01");
	});
});
