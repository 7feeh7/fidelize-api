import type { LoyaltyRule, LoyaltyTriggerType } from "@/entities/LoyaltyRule";

export interface LoyaltyRuleRecord {
	rule: LoyaltyRule;
	freeServiceName: string | null;
}

export interface ILoyaltyRulesRepository {
	save(tenantId: string, rule: LoyaltyRule): Promise<void>;
	findById(tenantId: string, id: string): Promise<LoyaltyRuleRecord | null>;
	listAll(tenantId: string): Promise<LoyaltyRuleRecord[]>;
	update(tenantId: string, rule: LoyaltyRule): Promise<void>;
	setActive(tenantId: string, id: string, active: boolean): Promise<void>;
	listActiveByTriggerType(
		tenantId: string,
		triggerType: LoyaltyTriggerType,
	): Promise<LoyaltyRuleRecord[]>;
}
