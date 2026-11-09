import type { Knex } from "knex";
import { LoyaltyRule, type LoyaltyTriggerType } from "@/entities/LoyaltyRule";
import type {
	ILoyaltyRulesRepository,
	LoyaltyRuleRecord,
} from "../ILoyaltyRulesRepository";

function mapRowToLoyaltyRule(row: Record<string, unknown>): LoyaltyRule {
	return new LoyaltyRule(
		{
			name: row.name as string,
			description: (row.description as string | null) ?? null,
			triggerType: row.trigger_type as LoyaltyRule["triggerType"],
			visitCount: (row.visit_count as number | null) ?? null,
			rewardType: row.reward_type as LoyaltyRule["rewardType"],
			rewardValue: row.reward_value == null ? null : Number(row.reward_value),
			freeServiceId: (row.free_service_id as string | null) ?? null,
			validDays: (row.valid_days as number | null) ?? null,
			active: row.active as boolean,
		},
		row.id as string,
	);
}

function mapRowToRecord(row: Record<string, unknown>): LoyaltyRuleRecord {
	return {
		rule: mapRowToLoyaltyRule(row),
		freeServiceName: (row.free_service_name as string | null) ?? null,
	};
}

function baseQuery(connection: Knex, tenantId: string) {
	return connection("loyalty_rules")
		.leftJoin("services", "services.id", "loyalty_rules.free_service_id")
		.where("loyalty_rules.tenant_id", tenantId)
		.select(
			"loyalty_rules.*",
			connection.raw("services.name as free_service_name"),
		);
}

export class PostgresLoyaltyRulesRepository implements ILoyaltyRulesRepository {
	constructor(private connection: Knex) {}

	async save(tenantId: string, rule: LoyaltyRule): Promise<void> {
		await this.connection("loyalty_rules").insert({
			tenant_id: tenantId,
			id: rule.id,
			name: rule.name,
			description: rule.description,
			trigger_type: rule.triggerType,
			visit_count: rule.visitCount,
			reward_type: rule.rewardType,
			reward_value: rule.rewardValue,
			free_service_id: rule.freeServiceId,
			valid_days: rule.validDays,
			active: rule.active,
		});
	}

	async findById(
		tenantId: string,
		id: string,
	): Promise<LoyaltyRuleRecord | null> {
		const row = await baseQuery(this.connection, tenantId)
			.where("loyalty_rules.id", id)
			.first();

		if (!row) {
			return null;
		}

		return mapRowToRecord(row);
	}

	async listAll(tenantId: string): Promise<LoyaltyRuleRecord[]> {
		const rows = await baseQuery(this.connection, tenantId).orderBy(
			"loyalty_rules.created_at",
			"desc",
		);

		return rows.map((row) => mapRowToRecord(row));
	}

	async update(tenantId: string, rule: LoyaltyRule): Promise<void> {
		await this.connection("loyalty_rules")
			.where({ tenant_id: tenantId, id: rule.id })
			.update({
				name: rule.name,
				description: rule.description,
				trigger_type: rule.triggerType,
				visit_count: rule.visitCount,
				reward_type: rule.rewardType,
				reward_value: rule.rewardValue,
				free_service_id: rule.freeServiceId,
				valid_days: rule.validDays,
				updated_at: this.connection.fn.now(),
			});
	}

	async setActive(
		tenantId: string,
		id: string,
		active: boolean,
	): Promise<void> {
		await this.connection("loyalty_rules")
			.where({ tenant_id: tenantId, id })
			.update({
				active,
				updated_at: this.connection.fn.now(),
			});
	}

	async listActiveByTriggerType(
		tenantId: string,
		triggerType: LoyaltyTriggerType,
	): Promise<LoyaltyRuleRecord[]> {
		const rows = await baseQuery(this.connection, tenantId)
			.where("loyalty_rules.active", true)
			.where("loyalty_rules.trigger_type", triggerType)
			.orderBy("loyalty_rules.created_at", "asc");

		return rows.map((row) => mapRowToRecord(row));
	}
}
