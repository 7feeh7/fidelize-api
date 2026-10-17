import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("referrals", (table) => {
		table.uuid("id").primary();
		table
			.uuid("referrer_id")
			.notNullable()
			.references("id")
			.inTable("customers");
		table
			.uuid("referred_id")
			.notNullable()
			.unique()
			.references("id")
			.inTable("customers");
		table.string("status", 20).notNullable();
		table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
		table.timestamp("converted_at", { useTz: true }).nullable();
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable("referrals");
}
