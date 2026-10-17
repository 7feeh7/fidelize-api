import { describe, expect, it } from "vitest";
import { buildWhatsAppLink } from "./buildWhatsAppLink";

describe("buildWhatsAppLink", () => {
	it("monta link com telefone normalizado e texto codificado", () => {
		const link = buildWhatsAppLink("(85) 99999-9999", "Olá Ana!");

		expect(link).toBe(
			"https://wa.me/5585999999999?text=Ol%C3%A1%20Ana!",
		);
	});

	it("retorna null quando não há telefone", () => {
		expect(buildWhatsAppLink("", "Olá")).toBeNull();
	});
});
