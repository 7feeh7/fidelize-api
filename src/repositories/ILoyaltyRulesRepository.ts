import type { LoyaltyRule, LoyaltyTriggerType } from "@/entities/LoyaltyRule";

export interface LoyaltyRuleRecord {
	rule: LoyaltyRule;
	freeServiceName: string | null;
}

export interface ILoyaltyRulesRepository {
	save(rule: LoyaltyRule): Promise<void>;
	findById(id: string): Promise<LoyaltyRuleRecord | null>;
	listAll(): Promise<LoyaltyRuleRecord[]>;
	update(rule: LoyaltyRule): Promise<void>;
	setActive(id: string, active: boolean): Promise<void>;
	listActiveByTriggerType(
		triggerType: LoyaltyTriggerType,
	): Promise<LoyaltyRuleRecord[]>;
}
