import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable("messages", (table) => {
		table.dropForeign(["appointment_item_id"]);
	});

	await knex.schema.alterTable("messages", (table) => {
		table
			.foreign("appointment_item_id")
			.references("id")
			.inTable("appointment_items")
			.onDelete("SET NULL");
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable("messages", (table) => {
		table.dropForeign(["appointment_item_id"]);
	});

	await knex.schema.alterTable("messages", (table) => {
		table
			.foreign("appointment_item_id")
			.references("id")
			.inTable("appointment_items");
	});
}
