import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("messages", (table) => {
		table.uuid("id").primary();
		table
			.uuid("customer_id")
			.notNullable()
			.references("id")
			.inTable("customers");
		table
			.uuid("template_id")
			.nullable()
			.references("id")
			.inTable("message_templates");
		table
			.uuid("appointment_item_id")
			.nullable()
			.references("id")
			.inTable("appointment_items");
		table
			.uuid("customer_reward_id")
			.nullable()
			.references("id")
			.inTable("customer_rewards");
		table.string("type", 30).notNullable();
		table.text("content").notNullable();
		table.string("status", 20).notNullable();
		table.date("scheduled_for").notNullable();
		table.timestamp("sent_at", { useTz: true }).nullable();
		table.uuid("sent_by").nullable().references("id").inTable("users");
		table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
	});

	await knex.raw(
		"CREATE INDEX messages_status_scheduled_for_idx ON messages (status, scheduled_for)",
	);
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable("messages");
}
