import { LoyaltyRule } from "@/entities/LoyaltyRule";
import type { ILoyaltyRulesRepository } from "@/repositories/ILoyaltyRulesRepository";
import type { IServicesRepository } from "@/repositories/IServicesRepository";
import { ensureFreeServiceForLoyaltyRule } from "@/utils/ensureFreeServiceForLoyaltyRule";
import {
	normalizeLoyaltyRuleInput,
	validateLoyaltyRuleInput,
} from "@/utils/loyaltyRuleValidation";
import type { ICreateLoyaltyRuleRequestDTO } from "./CreateLoyaltyRuleDTO";

export class CreateLoyaltyRuleUseCase {
	constructor(
		private loyaltyRulesRepository: ILoyaltyRulesRepository,
		private servicesRepository: IServicesRepository,
	) {}

	async execute(data: ICreateLoyaltyRuleRequestDTO): Promise<void> {
		validateLoyaltyRuleInput(data);
		const normalized = normalizeLoyaltyRuleInput(data);

		await ensureFreeServiceForLoyaltyRule(normalized, this.servicesRepository);

		const rule = new LoyaltyRule({
			...normalized,
			active: true,
		});

		await this.loyaltyRulesRepository.save(rule);
	}
}
