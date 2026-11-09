import type { Service } from "@/entities/Service";

export interface IServicesRepository {
	save(tenantId: string, service: Service): Promise<void>;
	findByName(tenantId: string, name: string): Promise<Service | null>;
	findById(tenantId: string, id: string): Promise<Service | null>;
	findActiveById(tenantId: string, id: string): Promise<Service | null>;
	listAll(tenantId: string): Promise<Service[]>;
	update(tenantId: string, service: Service): Promise<void>;
	deactivate(tenantId: string, id: string): Promise<void>;
}
