import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("customers", (table) => {
		table.uuid("id").primary();
		table.string("name", 255).notNullable();
		table.string("phone", 20).notNullable().unique();
		table.date("date_of_birth").nullable();
		table.string("lead_source", 20).notNullable();
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable("customers");
}
