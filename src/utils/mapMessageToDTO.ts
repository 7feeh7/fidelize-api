import type { MessageStatus } from "@/entities/Message";
import type { MessageTemplateType } from "@/entities/MessageTemplate";
import type { MessageListItem } from "@/repositories/IMessagesRepository";
import { buildWhatsAppLink } from "./buildWhatsAppLink";

export interface MessageDTO {
	id: string;
	customerId: string;
	customerName: string;
	customerPhone: string;
	templateId: string | null;
	appointmentItemId: string | null;
	customerRewardId: string | null;
	type: MessageTemplateType;
	content: string;
	status: MessageStatus;
	scheduledFor: string;
	sentAt: string | null;
	sentBy: string | null;
	sentByName: string | null;
	whatsappUrl: string | null;
	createdAt: string;
}

export function mapMessageToDTO(item: MessageListItem): MessageDTO {
	const { message, customerName, customerPhone, sentByName } = item;
	const whatsappUrl =
		message.status === "PENDING"
			? buildWhatsAppLink(customerPhone, message.content)
			: null;

	return {
		id: message.id as string,
		customerId: message.customerId,
		customerName,
		customerPhone,
		templateId: message.templateId,
		appointmentItemId: message.appointmentItemId,
		customerRewardId: message.customerRewardId,
		type: message.type,
		content: message.content,
		status: message.status,
		scheduledFor: message.scheduledFor,
		sentAt: message.sentAt?.toISOString() ?? null,
		sentBy: message.sentBy,
		sentByName,
		whatsappUrl,
		createdAt: message.createdAt.toISOString(),
	};
}
