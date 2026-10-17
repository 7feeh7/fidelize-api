import { describe, expect, it } from "vitest";
import { normalizePhoneForWhatsApp } from "./normalizePhoneForWhatsApp";

describe("normalizePhoneForWhatsApp", () => {
	it("remove caracteres não numéricos", () => {
		expect(normalizePhoneForWhatsApp("(85) 99999-9999")).toBe("5585999999999");
	});

	it("adiciona DDI 55 quando faltar", () => {
		expect(normalizePhoneForWhatsApp("85999999999")).toBe("5585999999999");
	});

	it("mantém número já internacional", () => {
		expect(normalizePhoneForWhatsApp("5585999999999")).toBe("5585999999999");
	});
});
