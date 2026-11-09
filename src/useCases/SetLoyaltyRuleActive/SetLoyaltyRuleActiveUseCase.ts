import type { ILoyaltyRulesRepository } from "@/repositories/ILoyaltyRulesRepository";
import type { ISetLoyaltyRuleActiveRequestDTO } from "./SetLoyaltyRuleActiveDTO";

export class SetLoyaltyRuleActiveUseCase {
	constructor(private loyaltyRulesRepository: ILoyaltyRulesRepository) {}

	async execute(
		tenantId: string,
		data: ISetLoyaltyRuleActiveRequestDTO,
	): Promise<void> {
		if (typeof data.active !== "boolean") {
			throw new Error("Status inválido");
		}

		const existing = await this.loyaltyRulesRepository.findById(
			tenantId,
			data.id,
		);

		if (!existing) {
			throw new Error("Regra de fidelidade não encontrada");
		}

		if (existing.rule.active === data.active) {
			return;
		}

		await this.loyaltyRulesRepository.setActive(tenantId, data.id, data.active);
	}
}
