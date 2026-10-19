export function isDailyRoutineEvent(event: unknown): boolean {
	if (typeof event !== "object" || event === null) {
		return false;
	}

	const record = event as Record<string, unknown>;

	return record.action === "daily-routine";
}
