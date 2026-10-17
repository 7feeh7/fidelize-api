import type { LoyaltyRuleItemDTO } from "@/utils/mapLoyaltyRuleToDTO";

export interface IGetLoyaltyRuleRequestDTO {
	id: string;
}

export type IGetLoyaltyRuleResponseDTO = LoyaltyRuleItemDTO;
