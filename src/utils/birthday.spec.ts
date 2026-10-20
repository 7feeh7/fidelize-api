import { describe, expect, it } from "vitest";
import {
	computeAge,
	getEndOfMonthExpiresAt,
	isBirthdayOnDate,
} from "./birthday";

describe("utilitários de aniversário", () => {
	it("identifica aniversário no dia e mês", () => {
		expect(isBirthdayOnDate("1990-05-15", "2026-05-15")).toBe(true);
		expect(isBirthdayOnDate("1990-05-15", "2026-05-16")).toBe(false);
	});

	it("trata 29/02 em ano não bissexto como 28/02", () => {
		expect(isBirthdayOnDate("2000-02-29", "2025-02-28")).toBe(true);
		expect(isBirthdayOnDate("2000-02-29", "2025-02-27")).toBe(false);
		expect(isBirthdayOnDate("2000-02-29", "2024-02-29")).toBe(true);
	});

	it("calcula idade considerando se o aniversário já ocorreu no ano", () => {
		expect(computeAge("1990-05-15", "2026-05-15")).toBe(36);
		expect(computeAge("1990-05-15", "2026-05-14")).toBe(35);
	});

	it("define validade no último instante do mês", () => {
		const expiresAt = getEndOfMonthExpiresAt("2026-10-17");

		expect(expiresAt.toISOString()).toBe("2026-10-31T23:59:59.999Z");
	});
});
