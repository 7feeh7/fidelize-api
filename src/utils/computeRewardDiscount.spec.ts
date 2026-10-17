import { describe, expect, it } from "vitest";
import { computeRewardDiscount } from "./computeRewardDiscount";

describe("computeRewardDiscount", () => {
	it("calcula desconto percentual sobre o subtotal", () => {
		const discount = computeRewardDiscount({
			rewardType: "PERCENT_DISCOUNT",
			rewardValue: 10,
			freeServiceId: null,
			subtotal: 200,
			itemServiceIds: ["s1"],
			itemPricesByServiceId: new Map([["s1", 200]]),
		});

		expect(discount).toBe(20);
	});

	it("limita desconto fixo ao subtotal", () => {
		const discount = computeRewardDiscount({
			rewardType: "FIXED_DISCOUNT",
			rewardValue: 150,
			freeServiceId: null,
			subtotal: 100,
			itemServiceIds: ["s1"],
			itemPricesByServiceId: new Map([["s1", 100]]),
		});

		expect(discount).toBe(100);
	});

	it("usa o preço do serviço gratuito presente no atendimento", () => {
		const discount = computeRewardDiscount({
			rewardType: "FREE_SERVICE",
			rewardValue: null,
			freeServiceId: "free-service",
			subtotal: 180,
			itemServiceIds: ["other", "free-service"],
			itemPricesByServiceId: new Map([
				["other", 100],
				["free-service", 80],
			]),
		});

		expect(discount).toBe(80);
	});

	it("falha quando o serviço grátis não está no atendimento", () => {
		expect(() =>
			computeRewardDiscount({
				rewardType: "FREE_SERVICE",
				rewardValue: null,
				freeServiceId: "free-service",
				subtotal: 100,
				itemServiceIds: ["other"],
				itemPricesByServiceId: new Map([["other", 100]]),
			}),
		).toThrow(
			"O serviço gratuito do benefício não está entre os itens do atendimento",
		);
	});
});
