import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.raw(`
		DELETE FROM messages a
		USING messages b
		WHERE a.appointment_item_id IS NOT NULL
			AND a.appointment_item_id = b.appointment_item_id
			AND a.created_at > b.created_at
	`);

	await knex.raw(`
		CREATE UNIQUE INDEX messages_appointment_item_id_unique
		ON messages (appointment_item_id)
		WHERE appointment_item_id IS NOT NULL
	`);
}

export async function down(knex: Knex): Promise<void> {
	await knex.raw("DROP INDEX IF EXISTS messages_appointment_item_id_unique");
}
