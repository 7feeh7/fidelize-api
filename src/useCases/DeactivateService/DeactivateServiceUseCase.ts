import type { IServicesRepository } from "@/repositories/IServicesRepository";
import type { IDeactivateServiceRequestDTO } from "./DeactivateServiceDTO";

export class DeactivateServiceUseCase {
	constructor(private servicesRepository: IServicesRepository) {}

	async execute(
		tenantId: string,
		{ id }: IDeactivateServiceRequestDTO,
	): Promise<void> {
		const service = await this.servicesRepository.findActiveById(tenantId, id);

		if (!service) {
			throw new Error("Serviço não encontrado");
		}

		await this.servicesRepository.deactivate(tenantId, id);
	}
}
