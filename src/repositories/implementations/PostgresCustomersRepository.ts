import type { Knex } from "knex";
import { Customer, type LeadSource } from "@/entities/Customer";
import type {
	ICustomersRepository,
	ListCustomersParams,
	ListCustomersResult,
} from "../ICustomersRepository";

function mapRowToCustomer(row: Record<string, unknown>): Customer {
	return new Customer(
		{
			name: row.name as string,
			phone: row.phone as string,
			dateOfBirth: (row.date_of_birth as string | null) ?? null,
			leadSource: row.lead_source as LeadSource,
			active: row.active as boolean,
		},
		row.id as string,
	);
}

export class PostgresCustomersRepository implements ICustomersRepository {
	constructor(private connection: Knex) {}

	async save(customer: Customer): Promise<void> {
		await this.connection("customers").insert({
			id: customer.id,
			name: customer.name,
			phone: customer.phone,
			date_of_birth: customer.dateOfBirth,
			lead_source: customer.leadSource,
			active: customer.active,
		});
	}

	async list({
		page,
		perPage,
		search,
	}: ListCustomersParams): Promise<ListCustomersResult> {
		const buildQuery = () => {
			const query = this.connection("customers").where({ active: true });
			const term = search?.trim();

			if (term) {
				const likeTerm = `%${term}%`;
				query.where(function applySearch() {
					this.whereILike("name", likeTerm).orWhereILike("phone", likeTerm);
				});
			}

			return query;
		};

		const countRow = await buildQuery()
			.count<{ count: string }>("* as count")
			.first();
		const total = Number(countRow?.count ?? 0);

		const rows = await buildQuery()
			.select("*")
			.orderBy("name", "asc")
			.limit(perPage)
			.offset((page - 1) * perPage);

		const items = rows.map((row) => mapRowToCustomer(row));

		return { items, total };
	}

	async findByPhone(phone: string): Promise<Customer | null> {
		const row = await this.connection("customers").where({ phone }).first();

		if (!row) {
			return null;
		}

		return mapRowToCustomer(row);
	}

	async findActiveById(id: string): Promise<Customer | null> {
		const row = await this.connection("customers")
			.where({ id, active: true })
			.first();

		if (!row) {
			return null;
		}

		return mapRowToCustomer(row);
	}

	async update(customer: Customer): Promise<void> {
		await this.connection("customers")
			.where({ id: customer.id, active: true })
			.update({
				name: customer.name,
				phone: customer.phone,
				date_of_birth: customer.dateOfBirth,
				lead_source: customer.leadSource,
				updated_at: this.connection.fn.now(),
			});
	}

	async deactivate(id: string): Promise<void> {
		await this.connection("customers")
			.where({ id, active: true })
			.update({
				active: false,
				updated_at: this.connection.fn.now(),
			});
	}
}
