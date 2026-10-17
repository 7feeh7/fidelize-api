import type { ILoyaltyRulesRepository } from "@/repositories/ILoyaltyRulesRepository";
import { mapLoyaltyRuleToDTO } from "@/utils/mapLoyaltyRuleToDTO";
import type { IListLoyaltyRulesResponseDTO } from "./ListLoyaltyRulesDTO";

export class ListLoyaltyRulesUseCase {
	constructor(private loyaltyRulesRepository: ILoyaltyRulesRepository) {}

	async execute(): Promise<IListLoyaltyRulesResponseDTO> {
		const records = await this.loyaltyRulesRepository.listAll();

		return {
			data: records.map((record) => mapLoyaltyRuleToDTO(record)),
		};
	}
}
