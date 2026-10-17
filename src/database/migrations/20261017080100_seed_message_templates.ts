import type { Knex } from "knex";

const RETURN_REMINDER_CONTENT =
	"Oi {nome}! Já faz {dias} dias do seu {servico}. Que tal agendar um retorno no {negocio}? Estamos com saudades!";

const BIRTHDAY_CONTENT =
	"Oi {nome}! Feliz aniversário! O {negocio} preparou um presente especial para você: {beneficio}. Válido até {validade}.";

export async function up(knex: Knex): Promise<void> {
	const existing = await knex("message_templates")
		.whereIn("type", ["RETURN_REMINDER", "BIRTHDAY"])
		.first();

	if (existing) {
		return;
	}

	await knex("message_templates").insert([
		{
			id: crypto.randomUUID(),
			name: "Lembrete de retorno",
			type: "RETURN_REMINDER",
			content: RETURN_REMINDER_CONTENT,
			active: true,
		},
		{
			id: crypto.randomUUID(),
			name: "Aniversário",
			type: "BIRTHDAY",
			content: BIRTHDAY_CONTENT,
			active: true,
		},
	]);
}

export async function down(knex: Knex): Promise<void> {
	await knex("message_templates")
		.whereIn("type", ["RETURN_REMINDER", "BIRTHDAY"])
		.whereIn("name", ["Lembrete de retorno", "Aniversário"])
		.delete();
}
