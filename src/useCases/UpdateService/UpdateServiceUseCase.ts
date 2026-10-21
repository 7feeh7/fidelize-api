import type { IServicesRepository } from "@/repositories/IServicesRepository";
import { validateServiceInput } from "@/utils/serviceValidation";
import type { IUpdateServiceRequestDTO } from "./UpdateServiceDTO";

export class UpdateServiceUseCase {
	constructor(private servicesRepository: IServicesRepository) {}

	async execute(data: IUpdateServiceRequestDTO): Promise<void> {
		validateServiceInput(data);

		const existing = await this.servicesRepository.findById(data.id);

		if (!existing) {
			throw new Error("Serviço não encontrado");
		}

		const serviceAlreadyExists = await this.servicesRepository.findByName(
			data.name,
		);

		if (serviceAlreadyExists && serviceAlreadyExists.id !== data.id) {
			throw new Error("O serviço já existe");
		}

		existing.name = data.name;
		existing.description = data.description ?? null;
		existing.price = data.price;
		existing.durationMinutes = data.durationMinutes ?? null;
		existing.suggestedReturnDays = data.suggestedReturnDays ?? null;

		await this.servicesRepository.update(existing);
	}
}
