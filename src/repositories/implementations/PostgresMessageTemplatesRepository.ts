import type { Knex } from "knex";
import {
	MessageTemplate,
	type AutomaticMessageTemplateType,
	type MessageTemplateType,
} from "@/entities/MessageTemplate";
import type { IMessageTemplatesRepository } from "../IMessageTemplatesRepository";

function mapRowToMessageTemplate(
	row: Record<string, unknown>,
): MessageTemplate {
	return new MessageTemplate(
		{
			name: row.name as string,
			type: row.type as MessageTemplateType,
			content: row.content as string,
			active: row.active as boolean,
		},
		row.id as string,
	);
}

export class PostgresMessageTemplatesRepository
	implements IMessageTemplatesRepository
{
	constructor(private connection: Knex) {}

	async save(template: MessageTemplate): Promise<void> {
		await this.connection("message_templates").insert({
			id: template.id,
			name: template.name,
			type: template.type,
			content: template.content,
			active: template.active,
		});
	}

	async findById(id: string): Promise<MessageTemplate | null> {
		const row = await this.connection("message_templates")
			.where({ id })
			.first();

		if (!row) {
			return null;
		}

		return mapRowToMessageTemplate(row);
	}

	async findActiveAutomaticByType(
		type: AutomaticMessageTemplateType,
	): Promise<MessageTemplate | null> {
		const row = await this.connection("message_templates")
			.where({ type, active: true })
			.first();

		if (!row) {
			return null;
		}

		return mapRowToMessageTemplate(row);
	}

	async listAll(): Promise<MessageTemplate[]> {
		const rows = await this.connection("message_templates").orderBy(
			"created_at",
			"desc",
		);

		return rows.map((row) => mapRowToMessageTemplate(row));
	}

	async update(template: MessageTemplate): Promise<void> {
		await this.connection("message_templates")
			.where({ id: template.id })
			.update({
				name: template.name,
				content: template.content,
				updated_at: this.connection.fn.now(),
			});
	}

	async setActive(id: string, active: boolean): Promise<void> {
		await this.connection("message_templates").where({ id }).update({
			active,
			updated_at: this.connection.fn.now(),
		});
	}

	async deactivateActiveByAutomaticType(
		type: Parameters<
			IMessageTemplatesRepository["deactivateActiveByAutomaticType"]
		>[0],
		exceptId?: string,
	): Promise<void> {
		let query = this.connection("message_templates").where({
			type,
			active: true,
		});

		if (exceptId) {
			query = query.whereNot({ id: exceptId });
		}

		await query.update({
			active: false,
			updated_at: this.connection.fn.now(),
		});
	}
}
