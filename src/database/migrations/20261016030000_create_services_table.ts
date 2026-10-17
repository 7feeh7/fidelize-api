import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("services", (table) => {
		table.uuid("id").primary();
		table.string("name", 100).notNullable().unique();
		table.text("description").nullable();
		table.decimal("price", 10, 2).notNullable();
		table.integer("duration_minutes").nullable();
		table.integer("suggested_return_days").nullable();
		table.boolean("active").notNullable().defaultTo(true);
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable("services");
}
