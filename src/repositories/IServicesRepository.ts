import type { Service } from "@/entities/Service";

export interface IServicesRepository {
	save(service: Service): Promise<void>;
	findByName(name: string): Promise<Service | null>;
	findById(id: string): Promise<Service | null>;
	findActiveById(id: string): Promise<Service | null>;
	listAll(): Promise<Service[]>;
	update(service: Service): Promise<void>;
	deactivate(id: string): Promise<void>;
}
