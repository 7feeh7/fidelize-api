import { Customer, LEAD_SOURCES } from "@/entities/Customer";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { CreateReferralUseCase } from "../CreateReferral/CreateReferralUseCase";
import type { ICreateCustomerRequestDTO } from "./CreateCustomerDTO";

export class CreateCustomerUseCase {
	constructor(
		private customersRepository: ICustomersRepository,
		private createReferralUseCase: CreateReferralUseCase,
	) {}

	async execute(data: ICreateCustomerRequestDTO) {
		if (!LEAD_SOURCES.includes(data.leadSource)) {
			throw new Error("Origem do lead inválida");
		}

		if (data.leadSource === "INDICACAO" && !data.referrerId?.trim()) {
			throw new Error("Informe quem indicou o cliente");
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

		if (data.leadSource === "INDICACAO" && data.referrerId?.trim()) {
			await this.createReferralUseCase.execute({
				referrerId: data.referrerId.trim(),
				referredId: customer.id as string,
			});
		}
	}
}
