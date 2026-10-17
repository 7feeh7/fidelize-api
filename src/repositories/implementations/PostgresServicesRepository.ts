import type { Knex } from "knex";
import { Service } from "@/entities/Service";
import type { IServicesRepository } from "../IServicesRepository";

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

		return new Service(
			{
				name: row.name,
				description: row.description,
				price: Number(row.price),
				durationMinutes: row.duration_minutes,
				suggestedReturnDays: row.suggested_return_days,
				active: row.active,
			},
			row.id,
		);
	}
}
