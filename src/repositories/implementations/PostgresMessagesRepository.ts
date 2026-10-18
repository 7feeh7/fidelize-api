import type { Knex } from "knex";
import { Message, type MessageStatus } from "@/entities/Message";
import { normalizeDateOnly } from "@/utils/dateOnly";
import type { MessageTemplateType } from "@/entities/MessageTemplate";
import type {
	IMessagesRepository,
	MessageListFilters,
	MessageListItem,
} from "../IMessagesRepository";

function mapRowToMessage(row: Record<string, unknown>): Message {
	return new Message(
		{
			customerId: row.customer_id as string,
			templateId: (row.template_id as string | null) ?? null,
			appointmentItemId: (row.appointment_item_id as string | null) ?? null,
			customerRewardId: (row.customer_reward_id as string | null) ?? null,
			type: row.type as MessageTemplateType,
			content: row.content as string,
			status: row.status as MessageStatus,
			scheduledFor: row.scheduled_for as string,
			sentAt: row.sent_at ? new Date(row.sent_at as string) : null,
			sentBy: (row.sent_by as string | null) ?? null,
			createdAt: new Date(row.created_at as string),
		},
		row.id as string,
	);
}

function mapRowToListItem(row: Record<string, unknown>): MessageListItem {
	return {
		message: mapRowToMessage(row),
		customerName: row.customer_name as string,
		customerPhone: row.customer_phone as string,
		customerDateOfBirth: normalizeDateOnly(row.customer_date_of_birth),
		sentByName: (row.sent_by_name as string | null) ?? null,
		returnReminderServiceName:
			(row.return_reminder_service_name as string | null) ?? null,
		returnReminderAppointmentDate: normalizeDateOnly(
			row.return_reminder_appointment_date,
		),
	};
}

function applyListFilters(
	query: Knex.QueryBuilder,
	filters: MessageListFilters,
): Knex.QueryBuilder {
	if (filters.status) {
		query = query.where("m.status", filters.status);
	}

	if (filters.type) {
		query = query.where("m.type", filters.type);
	}

	if (filters.customerId) {
		query = query.where("m.customer_id", filters.customerId);
	}

	if (filters.scheduledUntil) {
		query = query.where("m.scheduled_for", "<=", filters.scheduledUntil);
	}

	if (filters.scheduledFrom) {
		query = query.where("m.scheduled_for", ">=", filters.scheduledFrom);
	}

	return query;
}

export class PostgresMessagesRepository implements IMessagesRepository {
	constructor(private connection: Knex) {}

	private listJoinQuery() {
		return this.connection("messages as m")
			.join("customers as c", "m.customer_id", "c.id")
			.leftJoin("users as u", "m.sent_by", "u.id")
			.leftJoin("appointment_items as ai", "ai.id", "m.appointment_item_id")
			.leftJoin("appointments as a", "a.id", "ai.appointment_id")
			.leftJoin("services as s", "s.id", "ai.service_id");
	}

	private baseListQuery() {
		return this.listJoinQuery().select(
				"m.*",
				"c.name as customer_name",
				"c.phone as customer_phone",
				this.connection.raw("c.date_of_birth::date as customer_date_of_birth"),
				"u.name as sent_by_name",
				"s.name as return_reminder_service_name",
				this.connection.raw(
					"a.appointment_date::date as return_reminder_appointment_date",
				),
			);
	}

	async save(message: Message): Promise<void> {
		await this.connection("messages").insert({
			id: message.id,
			customer_id: message.customerId,
			template_id: message.templateId,
			appointment_item_id: message.appointmentItemId,
			customer_reward_id: message.customerRewardId,
			type: message.type,
			content: message.content,
			status: message.status,
			scheduled_for: message.scheduledFor,
			sent_at: message.sentAt,
			sent_by: message.sentBy,
			created_at: message.createdAt,
		});
	}

	async findById(id: string): Promise<Message | null> {
		const row = await this.connection("messages").where({ id }).first();

		if (!row) {
			return null;
		}

		return mapRowToMessage(row);
	}

	async findListItemById(id: string): Promise<MessageListItem | null> {
		const row = await this.baseListQuery().where("m.id", id).first();

		if (!row) {
			return null;
		}

		return mapRowToListItem(row);
	}

	async list(filters: MessageListFilters) {
		const buildFilterQuery = () =>
			applyListFilters(this.listJoinQuery(), filters);

		const countRow = await buildFilterQuery()
			.count<{ count: string }>("m.id as count")
			.first();
		const total = Number(countRow?.count ?? 0);

		let query = applyListFilters(this.baseListQuery(), filters);

		if (filters.sort === "recent_desc") {
			query = query
				.orderBy("m.created_at", "desc")
				.orderBy("m.scheduled_for", "desc");
		} else {
			query = query
				.orderBy("m.scheduled_for", "asc")
				.orderBy("m.created_at", "asc");
		}

		if (filters.page != null && filters.perPage != null) {
			query = query
				.limit(filters.perPage)
				.offset((filters.page - 1) * filters.perPage);
		}

		const rows = await query;

		return {
			total,
			items: rows.map((row) => mapRowToListItem(row)),
		};
	}

	async countPendingUntil(scheduledUntil: string): Promise<number> {
		const result = await this.connection("messages")
			.where({ status: "PENDING" })
			.andWhere("scheduled_for", "<=", scheduledUntil)
			.count<{ count: string }>("id as count")
			.first();

		return Number(result?.count ?? 0);
	}

	async updateContent(id: string, content: string): Promise<void> {
		await this.connection("messages").where({ id }).update({ content });
	}

	async markSent(id: string, sentBy: string, sentAt: Date): Promise<void> {
		await this.connection("messages").where({ id }).update({
			status: "SENT",
			sent_at: sentAt,
			sent_by: sentBy,
		});
	}

	async cancel(id: string): Promise<void> {
		await this.connection("messages").where({ id }).update({
			status: "CANCELED",
		});
	}

	async existsBirthdayMessageForYear(
		customerId: string,
		calendarYear: number,
	): Promise<boolean> {
		const row = await this.connection("messages")
			.where({
				customer_id: customerId,
				type: "BIRTHDAY",
			})
			.whereRaw("EXTRACT(YEAR FROM scheduled_for::date) = ?", [calendarYear])
			.first();

		return Boolean(row);
	}
}
