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
	save(message: Message): Promise<void>;
	saveIgnoringAppointmentItemConflict(message: Message): Promise<boolean>;
	findById(id: string): Promise<Message | null>;
	findListItemById(id: string): Promise<MessageListItem | null>;
	list(filters: MessageListFilters): Promise<MessageListResult>;
	countPendingUntil(scheduledUntil: string): Promise<number>;
	updateContent(id: string, content: string): Promise<void>;
	markSent(id: string, sentBy: string, sentAt: Date): Promise<void>;
	cancel(id: string): Promise<void>;
	existsBirthdayMessageForYear(
		customerId: string,
		calendarYear: number,
	): Promise<boolean>;
}
