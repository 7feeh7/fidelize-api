import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { IDeactivateCustomerRequestDTO } from "./DeactivateCustomerDTO";

export class DeactivateCustomerUseCase {
	constructor(private customersRepository: ICustomersRepository) {}

	async execute(
		tenantId: string,
		{ id }: IDeactivateCustomerRequestDTO,
	): Promise<void> {
		const customer = await this.customersRepository.findActiveById(
			tenantId,
			id,
		);

		if (!customer) {
			throw new Error("Cliente não encontrado");
		}

		await this.customersRepository.deactivate(tenantId, id);
	}
}
