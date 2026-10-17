import type { Service } from "@/entities/Service";

export interface IServicesRepository {
	save(service: Service): Promise<void>;
	findByName(name: string): Promise<Service | null>;
	findActiveById(id: string): Promise<Service | null>;
	listAll(): Promise<Service[]>;
	deactivate(id: string): Promise<void>;
}
