import type { CustomerRewardItemDTO } from "@/utils/mapCustomerRewardToDTO";

export interface IGrantManualCustomerRewardRequestDTO {
	customerId: string;
	loyaltyRuleId: string;
}

export interface IGrantManualCustomerRewardResponseDTO {
	reward: CustomerRewardItemDTO;
}
