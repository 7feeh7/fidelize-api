import type { MessageStatus } from "@/entities/Message";
import type { MessageTemplateType } from "@/entities/MessageTemplate";
import type { MessageDTO } from "@/utils/mapMessageToDTO";

export interface IListMessagesRequestDTO {
	status?: MessageStatus;
	type?: MessageTemplateType;
	customerId?: string;
	scheduledUntil?: string;
	scheduledFrom?: string;
}

export interface IListMessagesResponseDTO {
	data: MessageDTO[];
	pendingCount: number;
}
