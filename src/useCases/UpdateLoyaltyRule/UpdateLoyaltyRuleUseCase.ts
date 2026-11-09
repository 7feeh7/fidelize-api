import type { ILoyaltyRulesRepository } from "@/repositories/ILoyaltyRulesRepository";
import type { IServicesRepository } from "@/repositories/IServicesRepository";
import { ensureFreeServiceForLoyaltyRule } from "@/utils/ensureFreeServiceForLoyaltyRule";
import {
	normalizeLoyaltyRuleInput,
	validateLoyaltyRuleInput,
} from "@/utils/loyaltyRuleValidation";
import type { IUpdateLoyaltyRuleRequestDTO } from "./UpdateLoyaltyRuleDTO";

export class UpdateLoyaltyRuleUseCase {
	constructor(
		private loyaltyRulesRepository: ILoyaltyRulesRepository,
		private servicesRepository: IServicesRepository,
	) {}

	async execute(
		tenantId: string,
		data: IUpdateLoyaltyRuleRequestDTO,
	): Promise<void> {
		validateLoyaltyRuleInput(data);
		const normalized = normalizeLoyaltyRuleInput(data);

		const existing = await this.loyaltyRulesRepository.findById(
			tenantId,
			data.id,
		);

		if (!existing) {
			throw new Error("Regra de fidelidade não encontrada");
		}

		await ensureFreeServiceForLoyaltyRule(
			tenantId,
			normalized,
			this.servicesRepository,
		);

		const { rule } = existing;
		rule.name = normalized.name;
		rule.description = normalized.description;
		rule.triggerType = normalized.triggerType;
		rule.visitCount = normalized.visitCount;
		rule.rewardType = normalized.rewardType;
		rule.rewardValue = normalized.rewardValue;
		rule.freeServiceId = normalized.freeServiceId;
		rule.validDays = normalized.validDays;

		await this.loyaltyRulesRepository.update(tenantId, rule);
	}
}
