import type { ICustomerRewardsRepository } from "@/repositories/ICustomerRewardsRepository";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { ICancelCustomerRewardRequestDTO } from "./CancelCustomerRewardDTO";

export class CancelCustomerRewardUseCase {
	constructor(
		private customerRewardsRepository: ICustomerRewardsRepository,
		private customersRepository: ICustomersRepository,
	) {}

	async execute(data: ICancelCustomerRewardRequestDTO): Promise<void> {
		const customerId = data.customerId?.trim();
		const rewardId = data.rewardId?.trim();

		if (!customerId || !rewardId) {
			throw new Error("Benefício não encontrado");
		}

		const customer = await this.customersRepository.findActiveById(customerId);

		if (!customer) {
			throw new Error("Cliente não encontrado");
		}

		const reward = await this.customerRewardsRepository.findById(rewardId);

		if (!reward || reward.customerId !== customerId) {
			throw new Error("Benefício não encontrado");
		}

		if (reward.status !== "AVAILABLE") {
			throw new Error("Somente benefícios disponíveis podem ser cancelados");
		}

		reward.status = "CANCELED";
		await this.customerRewardsRepository.update(reward);
	}
}
