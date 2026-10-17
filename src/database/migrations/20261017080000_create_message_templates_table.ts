import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("message_templates", (table) => {
		table.uuid("id").primary();
		table.string("name", 100).notNullable();
		table.string("type", 30).notNullable();
		table.text("content").notNullable();
		table.boolean("active").notNullable().defaultTo(true);
		table.timestamps(true, true);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable("message_templates");
}
