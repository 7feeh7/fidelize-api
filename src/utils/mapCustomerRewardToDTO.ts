import type { CustomerRewardListItem } from "@/repositories/ICustomerRewardsRepository";
import { buildLoyaltyRulePresentation } from "./loyaltyRulePresentation";

export interface CustomerRewardItemDTO {
	id: string;
	customerId: string;
	loyaltyRuleId: string;
	referralId: string | null;
	appointmentId: string | null;
	status: string;
	grantedAt: string;
	expiresAt: string | null;
	usedAt: string | null;
	ruleName: string;
	rewardType: string;
	rewardValue: number | null;
	freeServiceId: string | null;
	rewardSummary: string;
	triggerLabel: string;
	preview: string;
}

export function mapCustomerRewardToDTO(
	item: CustomerRewardListItem,
): CustomerRewardItemDTO {
	const { reward } = item;
	const presentation = buildLoyaltyRulePresentation({
		triggerType: item.triggerType as Parameters<
			typeof buildLoyaltyRulePresentation
		>[0]["triggerType"],
		visitCount: item.visitCount,
		rewardType: item.rewardType as Parameters<
			typeof buildLoyaltyRulePresentation
		>[0]["rewardType"],
		rewardValue: item.rewardValue,
		freeServiceName: item.freeServiceName,
		validDays: item.validDays,
	});

	return {
		id: reward.id as string,
		customerId: reward.customerId,
		loyaltyRuleId: reward.loyaltyRuleId,
		referralId: reward.referralId,
		appointmentId: reward.appointmentId,
		status: reward.status,
		grantedAt: reward.grantedAt.toISOString(),
		expiresAt: reward.expiresAt?.toISOString() ?? null,
		usedAt: reward.usedAt?.toISOString() ?? null,
		ruleName: item.ruleName,
		rewardType: item.rewardType,
		rewardValue: item.rewardValue,
		freeServiceId: item.freeServiceId,
		rewardSummary: presentation.rewardSummary,
		triggerLabel: presentation.triggerLabel,
		preview: presentation.preview,
	};
}
