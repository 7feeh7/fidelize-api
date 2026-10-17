import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	const hasActiveColumn = await knex.schema.hasColumn("customers", "active");

	if (!hasActiveColumn) {
		await knex.schema.alterTable("customers", (table) => {
			table.boolean("active").notNullable().defaultTo(true);
		});
	}
}

export async function down(knex: Knex): Promise<void> {
	const hasActiveColumn = await knex.schema.hasColumn("customers", "active");

	if (hasActiveColumn) {
		await knex.schema.alterTable("customers", (table) => {
			table.dropColumn("active");
		});
	}
}
