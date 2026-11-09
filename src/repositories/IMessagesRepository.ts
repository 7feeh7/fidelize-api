import type { Message, MessageStatus } from "@/entities/Message";
import type { MessageTemplateType } from "@/entities/MessageTemplate";

export type MessageListSort = "scheduled_asc" | "recent_desc";

export interface MessageListFilters {
	status?: MessageStatus;
	type?: MessageTemplateType;
	customerId?: string;
	scheduledUntil?: string;
	scheduledFrom?: string;
	page?: number;
	perPage?: number;
	sort?: MessageListSort;
}

export interface MessageListResult {
	items: MessageListItem[];
	total: number;
}

export interface MessageListItem {
	message: Message;
	customerName: string;
	customerPhone: string;
	customerDateOfBirth: string | null;
	sentByName: string | null;
	returnReminderServiceName: string | null;
	returnReminderAppointmentDate: string | null;
}

export interface IMessagesRepository {
	save(tenantId: string, message: Message): Promise<void>;
	saveIgnoringAppointmentItemConflict(
		tenantId: string,
		message: Message,
	): Promise<boolean>;
	findById(tenantId: string, id: string): Promise<Message | null>;
	findListItemById(
		tenantId: string,
		id: string,
	): Promise<MessageListItem | null>;
	list(
		tenantId: string,
		filters: MessageListFilters,
	): Promise<MessageListResult>;
	countPendingUntil(tenantId: string, scheduledUntil: string): Promise<number>;
	updateContent(tenantId: string, id: string, content: string): Promise<void>;
	markSent(
		tenantId: string,
		id: string,
		sentBy: string,
		sentAt: Date,
	): Promise<void>;
	cancel(tenantId: string, id: string): Promise<void>;
	existsBirthdayMessageForYear(
		tenantId: string,
		customerId: string,
		calendarYear: number,
	): Promise<boolean>;
}
