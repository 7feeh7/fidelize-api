import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable("customer_rewards", (table) => {
		table.smallint("grant_year").nullable();
	});

	await knex.raw("DROP INDEX IF EXISTS customer_rewards_unique_grant");

	await knex.raw(`
		CREATE UNIQUE INDEX customer_rewards_unique_grant
		ON customer_rewards (
			customer_id,
			loyalty_rule_id,
			COALESCE(referral_id, '00000000-0000-0000-0000-000000000000'::uuid),
			COALESCE(grant_year, 0)
		)
	`);
}

export async function down(knex: Knex): Promise<void> {
	await knex.raw("DROP INDEX IF EXISTS customer_rewards_unique_grant");

	await knex.raw(`
		CREATE UNIQUE INDEX customer_rewards_unique_grant
		ON customer_rewards (
			customer_id,
			loyalty_rule_id,
			COALESCE(referral_id, '00000000-0000-0000-0000-000000000000'::uuid)
		)
	`);

	await knex.schema.alterTable("customer_rewards", (table) => {
		table.dropColumn("grant_year");
	});
}
