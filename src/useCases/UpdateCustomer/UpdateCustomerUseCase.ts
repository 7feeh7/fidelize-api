import { LEAD_SOURCES } from "@/entities/Customer";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { IUpdateCustomerRequestDTO } from "./UpdateCustomerDTO";

export class UpdateCustomerUseCase {
	constructor(private customersRepository: ICustomersRepository) {}

	async execute(data: IUpdateCustomerRequestDTO): Promise<void> {
		if (!LEAD_SOURCES.includes(data.leadSource)) {
			throw new Error("Origem do lead inválida");
		}

		const customer = await this.customersRepository.findActiveById(data.id);

		if (!customer) {
			throw new Error("Cliente não encontrado");
		}

		if (data.phone !== customer.phone) {
			const phoneInUse = await this.customersRepository.findByPhone(
				data.phone,
			);
			if (phoneInUse && phoneInUse.id !== customer.id) {
				throw new Error("O cliente já existe");
			}
		}

		customer.name = data.name;
		customer.phone = data.phone;
		customer.dateOfBirth = data.dateOfBirth ?? null;
		customer.leadSource = data.leadSource;

		await this.customersRepository.update(customer);
	}
}
