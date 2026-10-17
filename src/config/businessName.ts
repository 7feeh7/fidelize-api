export function getBusinessName(): string {
	const configured = process.env.BUSINESS_NAME?.trim();
	return configured && configured.length > 0 ? configured : "Fidelizei";
}
