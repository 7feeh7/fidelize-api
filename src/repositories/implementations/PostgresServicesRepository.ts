import type { Knex } from "knex";
import { Service } from "@/entities/Service";
import type { IServicesRepository } from "../IServicesRepository";

function mapRowToService(row: Record<string, unknown>): Service {
	return new Service(
		{
			name: row.name as string,
			description: (row.description as string | null) ?? null,
			price: Number(row.price),
			durationMinutes: (row.duration_minutes as number | null) ?? null,
			suggestedReturnDays: (row.suggested_return_days as number | null) ?? null,
			active: row.active as boolean,
		},
		row.id as string,
	);
}

export class PostgresServicesRepository implements IServicesRepository {
	constructor(private connection: Knex) {}

	async save(service: Service): Promise<void> {
		await this.connection("services").insert({
			id: service.id,
			name: service.name,
			description: service.description,
			price: service.price,
			duration_minutes: service.durationMinutes,
			suggested_return_days: service.suggestedReturnDays,
			active: service.active,
		});
	}

	async findByName(name: string): Promise<Service | null> {
		const row = await this.connection("services").where({ name }).first();

		if (!row) {
			return null;
		}

		return mapRowToService(row);
	}

	async findActiveById(id: string): Promise<Service | null> {
		const row = await this.connection("services")
			.where({ id, active: true })
			.first();

		if (!row) {
			return null;
		}

		return mapRowToService(row);
	}

	async listAll(): Promise<Service[]> {
		const rows = await this.connection("services")
			.select("*")
			.orderBy("name", "asc");

		return rows.map((row) => mapRowToService(row));
	}

	async deactivate(id: string): Promise<void> {
		await this.connection("services")
			.where({ id, active: true })
			.update({
				active: false,
				updated_at: this.connection.fn.now(),
			});
	}
}
