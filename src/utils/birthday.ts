export function isLeapYear(year: number): boolean {
	return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function getEffectiveBirthdayDayMonth(
	dateOfBirth: string,
	referenceYear: number,
): { month: number; day: number } {
	const [, monthStr, dayStr] = dateOfBirth.slice(0, 10).split("-");
	const month = Number(monthStr);
	const day = Number(dayStr);

	if (month === 2 && day === 29 && !isLeapYear(referenceYear)) {
		return { month: 2, day: 28 };
	}

	return { month, day };
}

export function isBirthdayOnDate(
	dateOfBirth: string,
	asOfDate: string,
): boolean {
	const [year, month, day] = asOfDate.slice(0, 10).split("-").map(Number);
	const effective = getEffectiveBirthdayDayMonth(dateOfBirth, year);

	return effective.month === month && effective.day === day;
}

export function computeAge(dateOfBirth: string, asOfDate: string): number {
	const [year, month, day] = asOfDate.slice(0, 10).split("-").map(Number);
	const birthYear = Number(dateOfBirth.slice(0, 4));
	let age = year - birthYear;
	const effective = getEffectiveBirthdayDayMonth(dateOfBirth, year);

	if (
		month < effective.month ||
		(month === effective.month && day < effective.day)
	) {
		age -= 1;
	}

	return age;
}

export function getEndOfMonthExpiresAt(asOfDate: string): Date {
	const [year, month] = asOfDate.slice(0, 10).split("-").map(Number);
	const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();

	return new Date(Date.UTC(year, month - 1, lastDay, 23, 59, 59, 999));
}

export function getCalendarYearFromDateOnly(asOfDate: string): number {
	return Number(asOfDate.slice(0, 10).split("-")[0]);
}
