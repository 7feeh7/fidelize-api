export function normalizePhoneForWhatsApp(phone: string): string {
	const digits = phone.replace(/\D/g, "");

	if (!digits) {
		return "";
	}

	if (digits.startsWith("55") && digits.length >= 12) {
		return digits;
	}

	if (digits.length === 10 || digits.length === 11) {
		return `55${digits}`;
	}

	return digits;
}
