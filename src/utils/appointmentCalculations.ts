export function roundMoney(value: number): number {
	return Math.round(value * 100) / 100;
}

export function computeSubtotal(items: { price: number }[]): number {
	return roundMoney(items.reduce((sum, item) => sum + item.price, 0));
}

export function computeTotal(subtotal: number, discountAmount: number): number {
	return roundMoney(subtotal - discountAmount);
}

export function computeReturnDueDate(
	appointmentDate: Date,
	suggestedReturnDays: number | null,
): string | null {
	if (suggestedReturnDays == null) {
		return null;
	}

	const date = new Date(appointmentDate);
	date.setUTCDate(date.getUTCDate() + suggestedReturnDays);
	return date.toISOString().slice(0, 10);
}
