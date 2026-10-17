import { describe, expect, it } from "vitest";
import { validateLoyaltyRuleInput } from "./loyaltyRuleValidation";

describe("validateLoyaltyRuleInput", () => {
	it("aceita regra de visita com desconto percentual", () => {
		expect(() =>
			validateLoyaltyRuleInput({
				name: "5ª visita",
				triggerType: "VISIT_COUNT",
				visitCount: 5,
				rewardType: "PERCENT_DISCOUNT",
				rewardValue: 10,
			}),
		).not.toThrow();
	});

	it("rejeita visit_count menor que 2", () => {
		expect(() =>
			validateLoyaltyRuleInput({
				name: "Visita",
				triggerType: "VISIT_COUNT",
				visitCount: 1,
				rewardType: "PERCENT_DISCOUNT",
				rewardValue: 10,
			}),
		).toThrow("Informe em qual visita o benefício será concedido (mínimo 2)");
	});

	it("rejeita serviço grátis sem free_service_id", () => {
		expect(() =>
			validateLoyaltyRuleInput({
				name: "Hidratação",
				triggerType: "FIRST_VISIT",
				rewardType: "FREE_SERVICE",
			}),
		).toThrow("Selecione o serviço grátis");
	});
});
