import { Service } from "@/entities/Service";
import type { IServicesRepository } from "@/repositories/IServicesRepository";
import { validateServiceInput } from "@/utils/serviceValidation";
import type { ICreateServiceRequestDTO } from "./CreateServiceDTO";

export class CreateServiceUseCase {
	constructor(private servicesRepository: IServicesRepository) {}

	async execute(data: ICreateServiceRequestDTO) {
		validateServiceInput(data);

		const serviceAlreadyExists = await this.servicesRepository.findByName(
			data.name,
		);
		if (serviceAlreadyExists) {
			throw new Error("O serviço já existe");
		}

		const service = new Service({
			name: data.name,
			description: data.description ?? null,
			price: data.price,
			durationMinutes: data.durationMinutes ?? null,
			suggestedReturnDays: data.suggestedReturnDays ?? null,
			active: data.active ?? true,
		});

		await this.servicesRepository.save(service);
	}
}
