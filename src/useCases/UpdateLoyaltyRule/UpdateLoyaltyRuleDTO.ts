import type {
	LoyaltyRewardType,
	LoyaltyTriggerType,
} from "@/entities/LoyaltyRule";

export interface IUpdateLoyaltyRuleRequestDTO {
	id: string;
	name: string;
	description?: string | null;
	triggerType: LoyaltyTriggerType;
	visitCount?: number | null;
	rewardType: LoyaltyRewardType;
	rewardValue?: number | null;
	freeServiceId?: string | null;
	validDays?: number | null;
}
