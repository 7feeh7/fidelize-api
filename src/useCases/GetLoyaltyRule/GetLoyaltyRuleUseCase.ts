import type { ILoyaltyRulesRepository } from "@/repositories/ILoyaltyRulesRepository";
import { mapLoyaltyRuleToDTO } from "@/utils/mapLoyaltyRuleToDTO";
import type {
	IGetLoyaltyRuleRequestDTO,
	IGetLoyaltyRuleResponseDTO,
} from "./GetLoyaltyRuleDTO";

export class GetLoyaltyRuleUseCase {
	constructor(private loyaltyRulesRepository: ILoyaltyRulesRepository) {}

	async execute(
		data: IGetLoyaltyRuleRequestDTO,
	): Promise<IGetLoyaltyRuleResponseDTO> {
		const record = await this.loyaltyRulesRepository.findById(data.id);

		if (!record) {
			throw new Error("Regra de fidelidade não encontrada");
		}

		return mapLoyaltyRuleToDTO(record);
	}
}
