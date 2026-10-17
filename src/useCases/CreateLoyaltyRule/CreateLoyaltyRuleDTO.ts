import type {
	LoyaltyRewardType,
	LoyaltyTriggerType,
} from "@/entities/LoyaltyRule";

export interface ICreateLoyaltyRuleRequestDTO {
	name: string;
	description?: string | null;
	triggerType: LoyaltyTriggerType;
	visitCount?: number | null;
	rewardType: LoyaltyRewardType;
	rewardValue?: number | null;
	freeServiceId?: string | null;
	validDays?: number | null;
}
