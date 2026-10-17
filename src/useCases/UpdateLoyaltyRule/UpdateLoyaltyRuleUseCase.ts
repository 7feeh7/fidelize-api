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

	async execute(data: IUpdateLoyaltyRuleRequestDTO): Promise<void> {
		validateLoyaltyRuleInput(data);
		const normalized = normalizeLoyaltyRuleInput(data);

		const existing = await this.loyaltyRulesRepository.findById(data.id);

		if (!existing) {
			throw new Error("Regra de fidelidade não encontrada");
		}

		await ensureFreeServiceForLoyaltyRule(normalized, this.servicesRepository);

		const { rule } = existing;
		rule.name = normalized.name;
		rule.description = normalized.description;
		rule.triggerType = normalized.triggerType;
		rule.visitCount = normalized.visitCount;
		rule.rewardType = normalized.rewardType;
		rule.rewardValue = normalized.rewardValue;
		rule.freeServiceId = normalized.freeServiceId;
		rule.validDays = normalized.validDays;

		await this.loyaltyRulesRepository.update(rule);
	}
}
