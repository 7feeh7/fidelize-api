import type { ICustomerRewardsRepository } from "@/repositories/ICustomerRewardsRepository";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { GrantCustomerRewardsService } from "@/services/GrantCustomerRewardsService";
import { mapCustomerRewardToDTO } from "@/utils/mapCustomerRewardToDTO";
import type {
	IGrantManualCustomerRewardRequestDTO,
	IGrantManualCustomerRewardResponseDTO,
} from "./GrantManualCustomerRewardDTO";

export class GrantManualCustomerRewardUseCase {
	constructor(
		private customersRepository: ICustomersRepository,
		private customerRewardsRepository: ICustomerRewardsRepository,
		private grantCustomerRewardsService: GrantCustomerRewardsService,
	) {}

	async execute(
		data: IGrantManualCustomerRewardRequestDTO,
	): Promise<IGrantManualCustomerRewardResponseDTO> {
		const customerId = data.customerId?.trim();
		const loyaltyRuleId = data.loyaltyRuleId?.trim();

		if (!customerId) {
			throw new Error("Informe o cliente");
		}

		if (!loyaltyRuleId) {
			throw new Error("Informe a regra de fidelidade");
		}

		const customer = await this.customersRepository.findActiveById(customerId);

		if (!customer) {
			throw new Error("Cliente não encontrado");
		}

		const granted = await this.grantCustomerRewardsService.grantManual(
			customerId,
			loyaltyRuleId,
		);

		const items = await this.customerRewardsRepository.listByCustomerId(
			customerId,
		);
		const rewardItem = items.find((item) => item.reward.id === granted.id);

		if (!rewardItem) {
			throw new Error("Não foi possível carregar o benefício concedido");
		}

		return {
			reward: mapCustomerRewardToDTO(rewardItem),
		};
	}
}
