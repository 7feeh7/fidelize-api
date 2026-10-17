import type { CustomerRewardStatus } from "@/entities/CustomerReward";
import type { CustomerRewardItemDTO } from "@/utils/mapCustomerRewardToDTO";

export interface IListCustomerRewardsRequestDTO {
	customerId: string;
	status?: CustomerRewardStatus;
}

export interface IListCustomerRewardsResponseDTO {
	data: CustomerRewardItemDTO[];
}
