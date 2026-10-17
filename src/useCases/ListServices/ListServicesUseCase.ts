import type { IServicesRepository } from "@/repositories/IServicesRepository";
import type { IListServicesResponseDTO } from "./ListServicesDTO";

export class ListServicesUseCase {
	constructor(private servicesRepository: IServicesRepository) {}

	async execute(): Promise<IListServicesResponseDTO> {
		const services = await this.servicesRepository.listAll();

		return {
			data: services.map((service) => ({
				id: service.id as string,
				name: service.name,
				price: service.price,
				suggestedReturnDays: service.suggestedReturnDays,
				active: service.active,
			})),
		};
	}
}
