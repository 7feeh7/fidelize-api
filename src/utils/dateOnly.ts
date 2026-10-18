export function normalizeDateOnly(value: unknown): string | null {
	if (value == null) {
		return null;
	}

	if (value instanceof Date) {
		const year = value.getUTCFullYear();
		const month = String(value.getUTCMonth() + 1).padStart(2, "0");
		const day = String(value.getUTCDate()).padStart(2, "0");
		return `${year}-${month}-${day}`;
	}

	if (typeof value === "string") {
		return value.slice(0, 10);
	}

	return String(value).slice(0, 10);
}

export function subtractDaysFromDateOnly(dateOnly: string, days: number): string {
	const date = new Date(`${dateOnly}T12:00:00.000Z`);
	date.setUTCDate(date.getUTCDate() - days);
	return date.toISOString().slice(0, 10);
}

export function daysBetweenDateOnly(
	fromDateOnly: string,
	toDateOnly: string,
): number {
	const start = new Date(`${fromDateOnly}T12:00:00.000Z`);
	const end = new Date(`${toDateOnly}T12:00:00.000Z`);
	return Math.floor((end.getTime() - start.getTime()) / 86_400_000);
}
