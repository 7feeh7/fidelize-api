import { normalizePhoneForWhatsApp } from "./normalizePhoneForWhatsApp";

export function buildWhatsAppLink(phone: string, text: string): string | null {
	const normalizedPhone = normalizePhoneForWhatsApp(phone);

	if (!normalizedPhone) {
		return null;
	}

	return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`;
}
