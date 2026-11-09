import type { Knex } from "knex";
import { Referral, type ReferralStatus } from "@/entities/Referral";
import type {
	IReferralsRepository,
	ListReferralsParams,
	ListReferralsResult,
	ReferralListItem,
} from "../IReferralsRepository";

function mapRowToReferral(row: Record<string, unknown>): Referral {
	return new Referral(
		{
			referrerId: row.referrer_id as string,
			referredId: row.referred_id as string,
			status: row.status as ReferralStatus,
			convertedAt: row.converted_at
				? new Date(row.converted_at as string)
				: null,
		},
		row.id as string,
	);
}

export class PostgresReferralsRepository implements IReferralsRepository {
	constructor(private connection: Knex) {}

	async save(tenantId: string, referral: Referral): Promise<void> {
		await this.connection("referrals").insert({
			tenant_id: tenantId,
			id: referral.id,
			referrer_id: referral.referrerId,
			referred_id: referral.referredId,
			status: referral.status,
			converted_at: referral.convertedAt,
		});
	}

	async findByReferredId(
		tenantId: string,
		referredId: string,
	): Promise<Referral | null> {
		const row = await this.connection("referrals")
			.where({ tenant_id: tenantId, referred_id: referredId })
			.first();

		if (!row) {
			return null;
		}

		return mapRowToReferral(row);
	}

	async findById(tenantId: string, id: string): Promise<Referral | null> {
		const row = await this.connection("referrals")
			.where({ tenant_id: tenantId, id })
			.first();

		if (!row) {
			return null;
		}

		return mapRowToReferral(row);
	}

	async update(tenantId: string, referral: Referral): Promise<void> {
		await this.connection("referrals")
			.where({ tenant_id: tenantId, id: referral.id })
			.update({
				status: referral.status,
				converted_at: referral.convertedAt,
			});
	}

	async list(
		tenantId: string,
		{ page, perPage, status, referrerId }: ListReferralsParams,
	): Promise<ListReferralsResult> {
		const buildQuery = () => {
			const query = this.connection("referrals as r")
				.join("customers as referrer", "referrer.id", "r.referrer_id")
				.join("customers as referred", "referred.id", "r.referred_id")
				.where("r.tenant_id", tenantId);

			if (status) {
				query.where("r.status", status);
			}

			if (referrerId) {
				query.where("r.referrer_id", referrerId);
			}

			return query;
		};

		const countRow = await buildQuery()
			.count<{ count: string }>("r.id as count")
			.first();
		const total = Number(countRow?.count ?? 0);

		const rows = await buildQuery()
			.select(
				"r.id",
				"r.referrer_id",
				"referrer.name as referrer_name",
				"r.referred_id",
				"referred.name as referred_name",
				"r.status",
				"r.created_at",
				"r.converted_at",
			)
			.orderBy("r.created_at", "desc")
			.limit(perPage)
			.offset((page - 1) * perPage);

		const items: ReferralListItem[] = rows.map((row) => ({
			id: row.id as string,
			referrerId: row.referrer_id as string,
			referrerName: row.referrer_name as string,
			referredId: row.referred_id as string,
			referredName: row.referred_name as string,
			status: row.status as ReferralStatus,
			createdAt: new Date(row.created_at as string),
			convertedAt: row.converted_at
				? new Date(row.converted_at as string)
				: null,
		}));

		return { items, total };
	}

	async countByReferrerId(
		tenantId: string,
		referrerId: string,
	): Promise<number> {
		const row = await this.connection("referrals")
			.where({ tenant_id: tenantId, referrer_id: referrerId })
			.whereNot({ status: "CANCELED" })
			.count<{ count: string }>("id as count")
			.first();

		return Number(row?.count ?? 0);
	}

	async convertPendingByReferredId(
		tenantId: string,
		referredId: string,
		convertedAt: Date,
		trx?: Knex.Transaction,
	): Promise<Referral[]> {
		const executor = trx ?? this.connection;
		const pendingRows = await executor("referrals")
			.where({
				tenant_id: tenantId,
				referred_id: referredId,
				status: "PENDING",
			})
			.select("*");

		if (pendingRows.length === 0) {
			return [];
		}

		await executor("referrals")
			.where({
				tenant_id: tenantId,
				referred_id: referredId,
				status: "PENDING",
			})
			.update({
				status: "CONVERTED",
				converted_at: convertedAt,
			});

		return pendingRows.map((row) =>
			mapRowToReferral({
				...row,
				status: "CONVERTED",
				converted_at: convertedAt,
			}),
		);
	}
}
