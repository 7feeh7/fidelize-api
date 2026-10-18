export function computeDaysSinceDate(
	referenceDate: string,
	pastDate: string,
): number {
	const referenceMs = Date.parse(`${referenceDate}T12:00:00.000Z`);
	const pastMs = Date.parse(`${pastDate}T12:00:00.000Z`);

	return Math.floor((referenceMs - pastMs) / 86_400_000);
}
