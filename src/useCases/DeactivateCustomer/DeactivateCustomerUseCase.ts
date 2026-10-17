import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { IDeactivateCustomerRequestDTO } from "./DeactivateCustomerDTO";

export class DeactivateCustomerUseCase {
	constructor(private customersRepository: ICustomersRepository) {}

	async execute({ id }: IDeactivateCustomerRequestDTO): Promise<void> {
		const customer = await this.customersRepository.findActiveById(id);

		if (!customer) {
			throw new Error("Cliente não encontrado");
		}

		await this.customersRepository.deactivate(id);
	}
}
