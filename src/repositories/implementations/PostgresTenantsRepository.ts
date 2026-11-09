import type { Knex } from "knex";
import {
	TENANT_STATUSES_WITH_ACCESS,
	Tenant,
	type TenantStatus,
} from "@/entities/Tenant";
import type { ITenantsRepository } from "../ITenantsRepository";

function mapRowToTenant(row: Record<string, unknown>): Tenant {
	return new Tenant(
		{
			name: row.name as string,
			slug: row.slug as string,
			status: row.status as TenantStatus,
		},
		row.id as string,
	);
}

export class PostgresTenantsRepository implements ITenantsRepository {
	constructor(private connection: Knex) {}

	async save(tenant: Tenant): Promise<void> {
		await this.connection("tenants").insert({
			id: tenant.id,
			name: tenant.name,
			slug: tenant.slug,
			status: tenant.status,
		});
	}

	async findById(id: string): Promise<Tenant | null> {
		const row = await this.connection("tenants").where({ id }).first();

		return row ? mapRowToTenant(row) : null;
	}

	async findBySlug(slug: string): Promise<Tenant | null> {
		const row = await this.connection("tenants").where({ slug }).first();

		return row ? mapRowToTenant(row) : null;
	}

	async listWithAccess(): Promise<Tenant[]> {
		const rows = await this.connection("tenants")
			.whereIn("status", TENANT_STATUSES_WITH_ACCESS)
			.orderBy("created_at", "asc");

		return rows.map((row) => mapRowToTenant(row));
	}
}
