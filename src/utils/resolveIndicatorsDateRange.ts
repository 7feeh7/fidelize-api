import { normalizeDateOnly } from "./dateOnly";
import { getTodayDateOnly } from "./getTodayDateOnly";

export const INDICATORS_MAX_MONTHS = 12;

export interface IndicatorsDateRange {
	startDate: string;
	endDate: string;
}

function isValidDateOnly(value: string): boolean {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return false;
	}

	return normalizeDateOnly(value) === value;
}

function getLastDayOfMonth(year: number, month: number): number {
	return new Date(year, month, 0).getDate();
}

export function getCurrentMonthDateRange(
	referenceDate = getTodayDateOnly(),
): IndicatorsDateRange {
	const year = Number(referenceDate.slice(0, 4));
	const month = Number(referenceDate.slice(5, 7));
	const lastDay = getLastDayOfMonth(year, month);
	const monthPart = referenceDate.slice(0, 7);
	const endOfMonth = `${monthPart}-${String(lastDay).padStart(2, "0")}`;

	return {
		startDate: `${monthPart}-01`,
		endDate: endOfMonth > referenceDate ? referenceDate : endOfMonth,
	};
}

export function getEarliestIndicatorsDate(
	referenceDate = getTodayDateOnly(),
): string {
	const year = Number(referenceDate.slice(0, 4));
	const month = Number(referenceDate.slice(5, 7));
	const earliest = new Date(year, month - 1 - (INDICATORS_MAX_MONTHS - 1), 1);
	const earliestYear = earliest.getFullYear();
	const earliestMonth = String(earliest.getMonth() + 1).padStart(2, "0");

	return `${earliestYear}-${earliestMonth}-01`;
}

function countMonthsInRange(startDate: string, endDate: string): number {
	const startYear = Number(startDate.slice(0, 4));
	const startMonth = Number(startDate.slice(5, 7));
	const endYear = Number(endDate.slice(0, 4));
	const endMonth = Number(endDate.slice(5, 7));

	return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
}

export function resolveIndicatorsDateRange(
	data: { startDate?: string; endDate?: string } = {},
	referenceDate?: string,
): IndicatorsDateRange {
	const today = referenceDate ?? getTodayDateOnly();
	const defaults = getCurrentMonthDateRange(today);
	const startDate = data.startDate?.trim() || defaults.startDate;
	const endDate = data.endDate?.trim() || defaults.endDate;

	if (!isValidDateOnly(startDate) || !isValidDateOnly(endDate)) {
		throw new Error("Informe um período válido");
	}

	if (startDate > endDate) {
		throw new Error("A data inicial deve ser anterior ou igual à data final");
	}

	if (countMonthsInRange(startDate, endDate) > INDICATORS_MAX_MONTHS) {
		throw new Error("O período não pode ser maior que 12 meses");
	}

	if (endDate > today) {
		throw new Error("A data final não pode ser futura");
	}

	const earliest = getEarliestIndicatorsDate(today);

	if (startDate < earliest) {
		throw new Error("O período deve estar dentro dos últimos 12 meses");
	}

	return { startDate, endDate };
}
