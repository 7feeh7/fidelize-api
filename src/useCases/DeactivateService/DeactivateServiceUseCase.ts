import type { IServicesRepository } from "@/repositories/IServicesRepository";
import type { IDeactivateServiceRequestDTO } from "./DeactivateServiceDTO";

export class DeactivateServiceUseCase {
	constructor(private servicesRepository: IServicesRepository) {}

	async execute({ id }: IDeactivateServiceRequestDTO): Promise<void> {
		const service = await this.servicesRepository.findActiveById(id);

		if (!service) {
			throw new Error("Serviço não encontrado");
		}

		await this.servicesRepository.deactivate(id);
	}
}
