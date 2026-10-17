import { describe, expect, it } from "vitest";
import { daysBetweenDateOnly, subtractDaysFromDateOnly } from "./dateOnly";

describe("dateOnly utils", () => {
	it("subtrai dias em datas somente-data", () => {
		expect(subtractDaysFromDateOnly("2026-10-17", 30)).toBe("2026-09-17");
	});

	it("calcula dias entre duas datas somente-data", () => {
		expect(daysBetweenDateOnly("2026-09-17", "2026-10-17")).toBe(30);
	});
});
