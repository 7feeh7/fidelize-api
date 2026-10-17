import type { Knex } from "knex";
import { Customer, type LeadSource } from "@/entities/Customer";
import type {
	ICustomersRepository,
	ListCustomersParams,
	ListCustomersResult,
} from "../ICustomersRepository";

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

	async list({
		page,
		perPage,
		search,
	}: ListCustomersParams): Promise<ListCustomersResult> {
		const buildQuery = () => {
			const query = this.connection("customers");
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

		const items = rows.map((row) =>
			new Customer(
				{
					name: row.name,
					phone: row.phone,
					dateOfBirth: row.date_of_birth,
					leadSource: row.lead_source as LeadSource,
				},
				row.id,
			),
		);

		return { items, total };
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
