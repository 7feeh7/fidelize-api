import type { LoyaltyRuleRecord } from "@/repositories/ILoyaltyRulesRepository";
import { buildLoyaltyRulePresentation } from "./loyaltyRulePresentation";

export interface LoyaltyRuleItemDTO {
	id: string;
	name: string;
	description: string | null;
	triggerType: string;
	visitCount: number | null;
	rewardType: string;
	rewardValue: number | null;
	freeServiceId: string | null;
	freeServiceName: string | null;
	validDays: number | null;
	active: boolean;
	rewardSummary: string;
	triggerLabel: string;
	preview: string;
}

export function mapLoyaltyRuleToDTO(
	record: LoyaltyRuleRecord,
): LoyaltyRuleItemDTO {
	const { rule, freeServiceName } = record;
	const presentation = buildLoyaltyRulePresentation({
		triggerType: rule.triggerType,
		visitCount: rule.visitCount,
		rewardType: rule.rewardType,
		rewardValue: rule.rewardValue,
		freeServiceName,
		validDays: rule.validDays,
	});

	return {
		id: rule.id as string,
		name: rule.name,
		description: rule.description,
		triggerType: rule.triggerType,
		visitCount: rule.visitCount,
		rewardType: rule.rewardType,
		rewardValue: rule.rewardValue,
		freeServiceId: rule.freeServiceId,
		freeServiceName,
		validDays: rule.validDays,
		active: rule.active,
		rewardSummary: presentation.rewardSummary,
		triggerLabel: presentation.triggerLabel,
		preview: presentation.preview,
	};
}
