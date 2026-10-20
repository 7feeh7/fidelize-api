import { describe, expect, it } from "vitest";
import {
	getCurrentMonthDateRange,
	getEarliestIndicatorsDate,
	resolveIndicatorsDateRange,
} from "./resolveIndicatorsDateRange";

describe("resolveIndicatorsDateRange", () => {
	it("usa o mês corrente até hoje como padrão", () => {
		expect(resolveIndicatorsDateRange({}, "2026-10-15")).toEqual({
			startDate: "2026-10-01",
			endDate: "2026-10-15",
		});
	});

	it("aceita intervalo personalizado dentro de 12 meses", () => {
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

	it("rejeita intervalos maiores que 12 meses", () => {
		expect(() =>
			resolveIndicatorsDateRange(
				{ startDate: "2025-01-01", endDate: "2026-01-31" },
				"2026-10-15",
			),
		).toThrow("O período não pode ser maior que 12 meses");
	});

	it("rejeita períodos anteriores aos últimos 12 meses", () => {
		expect(() =>
			resolveIndicatorsDateRange(
				{ startDate: "2025-09-01", endDate: "2025-09-30" },
				"2026-10-15",
			),
		).toThrow("O período deve estar dentro dos últimos 12 meses");
	});
});

describe("getCurrentMonthDateRange", () => {
	it("retorna os limites do mês", () => {
		expect(getCurrentMonthDateRange("2026-02-10")).toEqual({
			startDate: "2026-02-01",
			endDate: "2026-02-10",
		});
	});
});

describe("getEarliestIndicatorsDate", () => {
	it("retorna o primeiro dia 11 meses antes do mês de referência", () => {
		expect(getEarliestIndicatorsDate("2026-10-15")).toBe("2025-11-01");
	});
});
