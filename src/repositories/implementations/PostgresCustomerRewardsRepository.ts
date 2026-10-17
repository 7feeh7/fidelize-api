import type { Knex } from "knex";
import {
	CustomerReward,
	type CustomerRewardStatus,
} from "@/entities/CustomerReward";
import type {
	CustomerRewardListItem,
	ICustomerRewardsRepository,
} from "../ICustomerRewardsRepository";

const NULL_REFERRAL_SENTINEL = "00000000-0000-0000-0000-000000000000";

function mapRowToListItem(row: Record<string, unknown>): CustomerRewardListItem {
	return {
		reward: mapRowToCustomerReward(row),
		ruleName: row.rule_name as string,
		triggerType: row.trigger_type as string,
		visitCount: (row.visit_count as number | null) ?? null,
		rewardType: row.reward_type as string,
		rewardValue:
			row.reward_value == null ? null : Number(row.reward_value),
		freeServiceId: (row.free_service_id as string | null) ?? null,
		freeServiceName: (row.free_service_name as string | null) ?? null,
		validDays: (row.valid_days as number | null) ?? null,
	};
}

function mapRowToCustomerReward(row: Record<string, unknown>): CustomerReward {
	return new CustomerReward(
		{
			customerId: row.customer_id as string,
			loyaltyRuleId: row.loyalty_rule_id as string,
			referralId: (row.referral_id as string | null) ?? null,
			appointmentId: (row.appointment_id as string | null) ?? null,
			status: row.status as CustomerRewardStatus,
			grantedAt: new Date(row.granted_at as string),
			expiresAt: row.expires_at
				? new Date(row.expires_at as string)
				: null,
			usedAt: row.used_at ? new Date(row.used_at as string) : null,
		},
		row.id as string,
	);
}

export class PostgresCustomerRewardsRepository
	implements ICustomerRewardsRepository
{
	constructor(private connection: Knex) {}

	async save(reward: CustomerReward): Promise<void> {
		await this.connection("customer_rewards").insert({
			id: reward.id,
			customer_id: reward.customerId,
			loyalty_rule_id: reward.loyaltyRuleId,
			referral_id: reward.referralId,
			appointment_id: reward.appointmentId,
			status: reward.status,
			granted_at: reward.grantedAt,
			expires_at: reward.expiresAt,
			used_at: reward.usedAt,
		});
	}

	async existsByGrantKey(
		customerId: string,
		loyaltyRuleId: string,
		referralId: string | null,
	): Promise<boolean> {
		const row = await this.connection("customer_rewards")
			.where({
				customer_id: customerId,
				loyalty_rule_id: loyaltyRuleId,
			})
			.whereRaw(
				"COALESCE(referral_id, ?::uuid) = COALESCE(?, ?::uuid)",
				[NULL_REFERRAL_SENTINEL, referralId, NULL_REFERRAL_SENTINEL],
			)
			.first();

		return Boolean(row);
	}

	async findById(id: string): Promise<CustomerReward | null> {
		const row = await this.connection("customer_rewards").where({ id }).first();

		if (!row) {
			return null;
		}

		return mapRowToCustomerReward(row);
	}

	private buildDetailQuery() {
		return this.connection("customer_rewards as cr")
			.join("loyalty_rules as lr", "lr.id", "cr.loyalty_rule_id")
			.leftJoin("services", "services.id", "lr.free_service_id")
			.select(
				"cr.*",
				"lr.name as rule_name",
				"lr.trigger_type",
				"lr.visit_count",
				"lr.reward_type",
				"lr.reward_value",
				"lr.valid_days",
				"lr.free_service_id",
				this.connection.raw("services.name as free_service_name"),
			);
	}

	async findDetailById(id: string): Promise<CustomerRewardListItem | null> {
		const row = await this.buildDetailQuery().where("cr.id", id).first();

		if (!row) {
			return null;
		}

		return mapRowToListItem(row);
	}

	async findUsedDetailByAppointmentId(
		appointmentId: string,
	): Promise<CustomerRewardListItem | null> {
		const row = await this.buildDetailQuery()
			.where("cr.appointment_id", appointmentId)
			.where("cr.status", "USED")
			.first();

		if (!row) {
			return null;
		}

		return mapRowToListItem(row);
	}

	async expireAvailablePastDue(referenceDate: Date): Promise<number> {
		return this.connection("customer_rewards")
			.where("status", "AVAILABLE")
			.whereNotNull("expires_at")
			.where("expires_at", "<", referenceDate)
			.update({
				status: "EXPIRED",
				updated_at: this.connection.fn.now(),
			});
	}

	async listByCustomerId(
		customerId: string,
		status?: CustomerRewardStatus,
	): Promise<CustomerRewardListItem[]> {
		const query = this.buildDetailQuery()
			.where("cr.customer_id", customerId)
			.orderBy("cr.granted_at", "desc");

		if (status) {
			query.where("cr.status", status);
		}

		const rows = await query;

		return rows.map((row) => mapRowToListItem(row));
	}

	async update(reward: CustomerReward): Promise<void> {
		await this.connection("customer_rewards")
			.where({ id: reward.id })
			.update({
				status: reward.status,
				appointment_id: reward.appointmentId,
				used_at: reward.usedAt,
				expires_at: reward.expiresAt,
				updated_at: this.connection.fn.now(),
			});
	}
}
