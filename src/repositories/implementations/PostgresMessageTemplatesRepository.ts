import type { Knex } from "knex";
import {
	type AutomaticMessageTemplateType,
	MessageTemplate,
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

	async save(tenantId: string, template: MessageTemplate): Promise<void> {
		await this.connection("message_templates").insert({
			tenant_id: tenantId,
			id: template.id,
			name: template.name,
			type: template.type,
			content: template.content,
			active: template.active,
		});
	}

	async findById(
		tenantId: string,
		id: string,
	): Promise<MessageTemplate | null> {
		const row = await this.connection("message_templates")
			.where({ tenant_id: tenantId, id })
			.first();

		if (!row) {
			return null;
		}

		return mapRowToMessageTemplate(row);
	}

	async findActiveAutomaticByType(
		tenantId: string,
		type: AutomaticMessageTemplateType,
	): Promise<MessageTemplate | null> {
		const row = await this.connection("message_templates")
			.where({ tenant_id: tenantId, type, active: true })
			.first();

		if (!row) {
			return null;
		}

		return mapRowToMessageTemplate(row);
	}

	async listAll(tenantId: string): Promise<MessageTemplate[]> {
		const rows = await this.connection("message_templates")
			.where({ tenant_id: tenantId })
			.orderBy("created_at", "desc");

		return rows.map((row) => mapRowToMessageTemplate(row));
	}

	async update(tenantId: string, template: MessageTemplate): Promise<void> {
		await this.connection("message_templates")
			.where({ tenant_id: tenantId, id: template.id })
			.update({
				name: template.name,
				content: template.content,
				updated_at: this.connection.fn.now(),
			});
	}

	async setActive(
		tenantId: string,
		id: string,
		active: boolean,
	): Promise<void> {
		await this.connection("message_templates")
			.where({ tenant_id: tenantId, id })
			.update({
				active,
				updated_at: this.connection.fn.now(),
			});
	}

	async deactivateActiveByAutomaticType(
		tenantId: string,
		type: Parameters<
			IMessageTemplatesRepository["deactivateActiveByAutomaticType"]
		>[1],
		exceptId?: string,
	): Promise<void> {
		let query = this.connection("message_templates").where({
			tenant_id: tenantId,
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
