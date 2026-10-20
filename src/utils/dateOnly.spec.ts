import { describe, expect, it } from "vitest";
import { normalizeDateOnly } from "./dateOnly";

describe("normalizeDateOnly", () => {
	it("retorna null para valores nulos ou indefinidos", () => {
		expect(normalizeDateOnly(null)).toBeNull();
		expect(normalizeDateOnly(undefined)).toBeNull();
	});

	it("normaliza strings ISO", () => {
		expect(normalizeDateOnly("1990-05-15T00:00:00.000Z")).toBe("1990-05-15");
	});

	it("normaliza valores Date vindos do PostgreSQL", () => {
		expect(normalizeDateOnly(new Date("1990-05-15T00:00:00.000Z"))).toBe(
			"1990-05-15",
		);
	});
});
