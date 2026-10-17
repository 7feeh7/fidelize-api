import type { MessageTemplateType } from "@/entities/MessageTemplate";

export interface ICreateMessageTemplateRequestDTO {
	name: string;
	type: MessageTemplateType;
	content: string;
}
