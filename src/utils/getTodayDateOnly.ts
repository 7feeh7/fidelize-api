export function getTodayDateOnly(referenceDate = new Date()): string {
	return referenceDate.toISOString().slice(0, 10);
}
