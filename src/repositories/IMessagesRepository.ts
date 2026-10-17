import type { Message, MessageStatus } from "@/entities/Message";
import type { MessageTemplateType } from "@/entities/MessageTemplate";

export interface MessageListFilters {
	status?: MessageStatus;
	type?: MessageTemplateType;
	customerId?: string;
	scheduledUntil?: string;
	scheduledFrom?: string;
}

export interface MessageListItem {
	message: Message;
	customerName: string;
	customerPhone: string;
	sentByName: string | null;
	returnReminderServiceName: string | null;
	returnReminderAppointmentDate: string | null;
}

export interface IMessagesRepository {
	save(message: Message): Promise<void>;
	findById(id: string): Promise<Message | null>;
	findListItemById(id: string): Promise<MessageListItem | null>;
	list(filters: MessageListFilters): Promise<MessageListItem[]>;
	countPendingUntil(scheduledUntil: string): Promise<number>;
	updateContent(id: string, content: string): Promise<void>;
	markSent(id: string, sentBy: string, sentAt: Date): Promise<void>;
	cancel(id: string): Promise<void>;
}
