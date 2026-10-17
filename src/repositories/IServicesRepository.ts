import type { Service } from "@/entities/Service";

export interface IServicesRepository {
	save(service: Service): Promise<void>;
	findByName(name: string): Promise<Service | null>;
}
