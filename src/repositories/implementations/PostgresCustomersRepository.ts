import type { Knex } from "knex";
import { Customer, type LeadSource } from "@/entities/Customer";
import type { ICustomersRepository } from "../ICustomersRepository";

export class PostgresCustomersRepository implements ICustomersRepository {
	constructor(private connection: Knex) {}

	async save(customer: Customer): Promise<void> {
		await this.connection("customers").insert({
			id: customer.id,
			name: customer.name,
			phone: customer.phone,
			date_of_birth: customer.dateOfBirth,
			lead_source: customer.leadSource,
		});
	}

	async findByPhone(phone: string): Promise<Customer | null> {
		const row = await this.connection("customers").where({ phone }).first();

		if (!row) {
			return null;
		}

		return new Customer(
			{
				name: row.name,
				phone: row.phone,
				dateOfBirth: row.date_of_birth,
				leadSource: row.lead_source as LeadSource,
			},
			row.id,
		);
	}
}
