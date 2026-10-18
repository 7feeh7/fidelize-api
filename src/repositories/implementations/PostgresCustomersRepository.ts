import type { Knex } from "knex";
import { Customer, type LeadSource } from "@/entities/Customer";
import { normalizeDateOnly } from "@/utils/dateOnly";
import type {
	CustomerProfileRecord,
	ICustomersRepository,
	ListCustomersParams,
	ListCustomersResult,
} from "../ICustomersRepository";

function mapRowToCustomer(row: Record<string, unknown>): Customer {
	return new Customer(
		{
			name: row.name as string,
			phone: row.phone as string,
			dateOfBirth: normalizeDateOnly(row.date_of_birth),
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
			const query = this.connection("customers").where({
				"customers.active": true,
			});
			const term = search?.trim();

			if (term) {
				const likeTerm = `%${term}%`;
				query.where(function applySearch() {
					this.whereILike("customers.name", likeTerm).orWhereILike(
						"customers.phone",
						likeTerm,
					);
				});
			}

			return query;
		};

		const countRow = await buildQuery()
			.count<{ count: string }>("* as count")
			.first();
		const total = Number(countRow?.count ?? 0);

		const rows = await buildQuery()
			.select(
				"customers.*",
				"referrals.referrer_id",
				"referrer.name as referrer_name",
				this.connection.raw(
					`(select count(*)::int from referrals r where r.referrer_id = customers.id and r.status != 'CANCELED') as referrals_made_count`,
				),
			)
			.leftJoin("referrals", function joinReferrals() {
				this.on("referrals.referred_id", "=", "customers.id").andOnNotIn(
					"referrals.status",
					["CANCELED"],
				);
			})
			.leftJoin("customers as referrer", "referrer.id", "referrals.referrer_id")
			.orderBy("customers.name", "asc")
			.limit(perPage)
			.offset((page - 1) * perPage);

		const items = rows.map((row) => ({
			customer: mapRowToCustomer(row),
			referrerId: (row.referrer_id as string | null) ?? null,
			referrerName: (row.referrer_name as string | null) ?? null,
			referralsMadeCount: Number(row.referrals_made_count ?? 0),
		}));

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

	async findActiveProfileById(
		id: string,
	): Promise<CustomerProfileRecord | null> {
		const row = await this.connection("customers")
			.where({ "customers.id": id, "customers.active": true })
			.select(
				"customers.*",
				"referrals.referrer_id",
				"referrer.name as referrer_name",
				this.connection.raw(
					`(select count(*)::int from referrals r where r.referrer_id = customers.id and r.status != 'CANCELED') as referrals_made_count`,
				),
			)
			.leftJoin("referrals", function joinReferrals() {
				this.on("referrals.referred_id", "=", "customers.id").andOnNotIn(
					"referrals.status",
					["CANCELED"],
				);
			})
			.leftJoin("customers as referrer", "referrer.id", "referrals.referrer_id")
			.first();

		if (!row) {
			return null;
		}

		return {
			customer: mapRowToCustomer(row),
			referrerId: (row.referrer_id as string | null) ?? null,
			referrerName: (row.referrer_name as string | null) ?? null,
			referralsMadeCount: Number(row.referrals_made_count ?? 0),
		};
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
		await this.connection("customers").where({ id, active: true }).update({
			active: false,
			updated_at: this.connection.fn.now(),
		});
	}
}
