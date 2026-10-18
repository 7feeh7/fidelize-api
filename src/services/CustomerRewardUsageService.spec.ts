import { describe, expect, it } from "vitest";
import { CustomerReward } from "@/entities/CustomerReward";
import type { CustomerRewardListItem } from "@/repositories/ICustomerRewardsRepository";
import { CustomerRewardUsageService } from "./CustomerRewardUsageService";

function buildRewardItem(
	overrides: Partial<CustomerRewardListItem> = {},
): CustomerRewardListItem {
	const reward = new CustomerReward(
		{
			customerId: "customer-id",
			loyaltyRuleId: "rule-id",
			referralId: null,
			appointmentId: null,
			grantYear: null,
			status: "AVAILABLE",
			grantedAt: new Date("2026-10-01T12:00:00.000Z"),
			expiresAt: new Date("2026-12-01T12:00:00.000Z"),
			usedAt: null,
		},
		"reward-id",
	);

	return {
		reward,
		ruleName: "Regra",
		triggerType: "FIRST_VISIT",
		visitCount: null,
		rewardType: "PERCENT_DISCOUNT",
		rewardValue: 10,
		freeServiceId: null,
		freeServiceName: null,
		validDays: 30,
		...overrides,
	};
}

describe("CustomerRewardUsageService", () => {
	const sut = new CustomerRewardUsageService();

	it("exige observações quando o desconto difere do calculado", () => {
		expect(() =>
			sut.resolveDiscountAmount({
				customerRewardId: "reward-id",
				rewardDiscount: 20,
				requestedDiscount: 15,
				notes: null,
			}),
		).toThrow("Informe observações ao alterar o desconto do benefício");
	});

	it("libera benefício válido para disponível", () => {
		const reward = buildRewardItem().reward;
		reward.status = "USED";
		reward.appointmentId = "appointment-id";
		reward.usedAt = new Date("2026-10-10T12:00:00.000Z");

		sut.releaseFromAppointment(reward, new Date("2026-10-15T12:00:00.000Z"));

		expect(reward.status).toBe("AVAILABLE");
		expect(reward.appointmentId).toBeNull();
		expect(reward.usedAt).toBeNull();
	});

	it("marca como expirado ao liberar benefício vencido", () => {
		const rewardItem = buildRewardItem({
			reward: new CustomerReward(
				{
					customerId: "customer-id",
					loyaltyRuleId: "rule-id",
					referralId: null,
					appointmentId: "appointment-id",
					grantYear: null,
					status: "USED",
					grantedAt: new Date("2026-09-01T12:00:00.000Z"),
					expiresAt: new Date("2026-10-05T12:00:00.000Z"),
					usedAt: new Date("2026-10-04T12:00:00.000Z"),
				},
				"reward-id",
			),
		});

		sut.releaseFromAppointment(
			rewardItem.reward,
			new Date("2026-10-10T12:00:00.000Z"),
		);

		expect(rewardItem.reward.status).toBe("EXPIRED");
	});
});
