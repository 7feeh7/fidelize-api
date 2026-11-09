import type { IServicesRepository } from "@/repositories/IServicesRepository";
import type { IListServicesResponseDTO } from "./ListServicesDTO";

export class ListServicesUseCase {
	constructor(private servicesRepository: IServicesRepository) {}

	async execute(tenantId: string): Promise<IListServicesResponseDTO> {
		const services = await this.servicesRepository.listAll(tenantId);

		return {
			data: services.map((service) => ({
				id: service.id as string,
				name: service.name,
				description: service.description,
				price: service.price,
				durationMinutes: service.durationMinutes,
				suggestedReturnDays: service.suggestedReturnDays,
				active: service.active,
			})),
		};
	}
}
