import type { CustomerRewardStatus } from "@/entities/CustomerReward";
import type { CustomerRewardItemDTO } from "@/utils/mapCustomerRewardToDTO";

export interface IListCustomerRewardsRequestDTO {
	customerId: string;
	status?: CustomerRewardStatus;
	page?: number;
	perPage?: number;
}

export interface IListCustomerRewardsResponseDTO {
	data: CustomerRewardItemDTO[];
	page: number;
	totalPages: number;
}
