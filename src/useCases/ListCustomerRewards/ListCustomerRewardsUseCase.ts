import { CUSTOMER_REWARD_STATUSES } from "@/entities/CustomerReward";
import type { ICustomerRewardsRepository } from "@/repositories/ICustomerRewardsRepository";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import { mapCustomerRewardToDTO } from "@/utils/mapCustomerRewardToDTO";
import type {
	IListCustomerRewardsRequestDTO,
	IListCustomerRewardsResponseDTO,
} from "./ListCustomerRewardsDTO";

export class ListCustomerRewardsUseCase {
	constructor(
		private customerRewardsRepository: ICustomerRewardsRepository,
		private customersRepository: ICustomersRepository,
	) {}

	async execute(
		data: IListCustomerRewardsRequestDTO,
	): Promise<IListCustomerRewardsResponseDTO> {
		if (
			data.status &&
			!CUSTOMER_REWARD_STATUSES.includes(data.status)
		) {
			throw new Error("Status de benefício inválido");
		}

		const customerId = data.customerId?.trim();

		if (!customerId) {
			throw new Error("Informe o cliente");
		}

		const customer = await this.customersRepository.findActiveById(customerId);

		if (!customer) {
			throw new Error("Cliente não encontrado");
		}

		const items = await this.customerRewardsRepository.listByCustomerId(
			customerId,
			data.status,
		);

		return {
			data: items.map(mapCustomerRewardToDTO),
		};
	}
}
