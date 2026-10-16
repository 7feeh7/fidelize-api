import { Customer, LEAD_SOURCES } from "@/entities/Customer";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { ICreateCustomerRequestDTO } from "./CreateCustomerDTO";

export class CreateCustomerUseCase {
	constructor(private customersRepository: ICustomersRepository) {}

	async execute(data: ICreateCustomerRequestDTO) {
		if (!LEAD_SOURCES.includes(data.leadSource)) {
			throw new Error("Origem do lead inválida");
		}

		const customerAlreadyExists = await this.customersRepository.findByPhone(
			data.phone,
		);
		if (customerAlreadyExists) {
			throw new Error("O cliente já existe");
		}

		const customer = new Customer({
			name: data.name,
			phone: data.phone,
			dateOfBirth: data.dateOfBirth ?? null,
			leadSource: data.leadSource,
		});

		await this.customersRepository.save(customer);
	}
}
