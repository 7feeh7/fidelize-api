import { describe, expect, it } from "vitest";
import {
	formatLoyaltyRulePreview,
	formatLoyaltyRuleRewardSummary,
} from "./loyaltyRulePresentation";

describe("loyaltyRulePresentation", () => {
	it("formata resumo de desconto percentual", () => {
		expect(
			formatLoyaltyRuleRewardSummary({
				rewardType: "PERCENT_DISCOUNT",
				rewardValue: 10,
			}),
		).toBe("10% de desconto");
	});

	it("formata pré-visualização de serviço grátis na 5ª visita", () => {
		expect(
			formatLoyaltyRulePreview({
				triggerType: "VISIT_COUNT",
				visitCount: 5,
				rewardType: "FREE_SERVICE",
				rewardValue: null,
				freeServiceName: "Hidratação",
				validDays: 60,
			}),
		).toBe(
			"Na 5ª visita, o cliente ganha Hidratação grátis, válida por 60 dias",
		);
	});
});
