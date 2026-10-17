import { Service } from "@/entities/Service";
import type { IServicesRepository } from "@/repositories/IServicesRepository";
import type { ICreateServiceRequestDTO } from "./CreateServiceDTO";

export class CreateServiceUseCase {
	constructor(private servicesRepository: IServicesRepository) {}

	async execute(data: ICreateServiceRequestDTO) {
		if (data.price < 0) {
			throw new Error("Preço inválido");
		}

		if (
			data.durationMinutes != null &&
			(!Number.isInteger(data.durationMinutes) || data.durationMinutes <= 0)
		) {
			throw new Error("Duração inválida");
		}

		if (
			data.suggestedReturnDays != null &&
			(!Number.isInteger(data.suggestedReturnDays) ||
				data.suggestedReturnDays <= 0)
		) {
			throw new Error("Prazo de retorno sugerido inválido");
		}

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
