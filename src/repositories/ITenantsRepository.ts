import type { Tenant } from "@/entities/Tenant";

export interface ITenantsRepository {
	save(tenant: Tenant): Promise<void>;
	findById(id: string): Promise<Tenant | null>;
	findBySlug(slug: string): Promise<Tenant | null>;
	listWithAccess(): Promise<Tenant[]>;
}
