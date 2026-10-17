import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("customer_rewards", (table) => {
		table.uuid("id").primary();
		table
			.uuid("customer_id")
			.notNullable()
			.references("id")
			.inTable("customers");
		table
			.uuid("loyalty_rule_id")
			.notNullable()
			.references("id")
			.inTable("loyalty_rules");
		table
			.uuid("referral_id")
			.nullable()
			.references("id")
			.inTable("referrals");
		table
			.uuid("appointment_id")
			.nullable()
			.references("id")
			.inTable("appointments");
		table.string("status", 20).notNullable();
		table.timestamp("granted_at", { useTz: true }).notNullable();
		table.timestamp("expires_at", { useTz: true }).nullable();
		table.timestamp("used_at", { useTz: true }).nullable();
		table.timestamps(true, true);
	});

	await knex.raw(`
		CREATE UNIQUE INDEX customer_rewards_unique_grant
		ON customer_rewards (
			customer_id,
			loyalty_rule_id,
			COALESCE(referral_id, '00000000-0000-0000-0000-000000000000'::uuid)
		)
	`);
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable("customer_rewards");
}
