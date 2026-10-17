import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable("appointments", (table) => {
		table.uuid("id").primary();
		table
			.uuid("customer_id")
			.notNullable()
			.references("id")
			.inTable("customers");
		table.uuid("user_id").nullable().references("id").inTable("users");
		table.timestamp("appointment_date", { useTz: true }).notNullable();
		table.decimal("subtotal", 10, 2).notNullable();
		table.decimal("discount_amount", 10, 2).notNullable().defaultTo(0);
		table.decimal("total", 10, 2).notNullable();
		table.text("notes").nullable();
		table.timestamps(true, true);
	});

	await knex.schema.createTable("appointment_items", (table) => {
		table.uuid("id").primary();
		table
			.uuid("appointment_id")
			.notNullable()
			.references("id")
			.inTable("appointments")
			.onDelete("CASCADE");
		table.uuid("service_id").notNullable().references("id").inTable("services");
		table.decimal("price", 10, 2).notNullable();
		table.date("return_due_date").nullable();
		table.timestamp("created_at", { useTz: true }).defaultTo(knex.fn.now());
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTable("appointment_items");
	await knex.schema.dropTable("appointments");
}
