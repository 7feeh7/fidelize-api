import { describe, expect, it } from "vitest";
import { normalizeDateOnly } from "./dateOnly";

describe("normalizeDateOnly", () => {
	it("returns null for nullish values", () => {
		expect(normalizeDateOnly(null)).toBeNull();
		expect(normalizeDateOnly(undefined)).toBeNull();
	});

	it("normalizes ISO strings", () => {
		expect(normalizeDateOnly("1990-05-15T00:00:00.000Z")).toBe("1990-05-15");
	});

	it("normalizes Date values from pg", () => {
		expect(normalizeDateOnly(new Date("1990-05-15T00:00:00.000Z"))).toBe(
			"1990-05-15",
		);
	});
});
