import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("loyalty_rules", (table) => {
		table.uuid("id").primary();
		table.string("name", 100).notNullable();
		table.text("description").nullable();
		table.string("trigger_type", 30).notNullable();
		table.integer("visit_count").nullable();
		table.string("reward_type", 30).notNullable();
		table.decimal("reward_value", 10, 2).nullable();
		table
			.uuid("free_service_id")
			.nullable()
			.references("id")
			.inTable("services");
		table.integer("valid_days").nullable();
		table.boolean("active").notNullable().defaultTo(true);
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable("loyalty_rules");
}
