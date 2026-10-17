import type { MessageTemplate } from "@/entities/MessageTemplate";

export interface MessageTemplateDTO {
	id: string;
	name: string;
	type: string;
	content: string;
	active: boolean;
}

export function mapMessageTemplateToDTO(
	template: MessageTemplate,
): MessageTemplateDTO {
	return {
		id: template.id as string,
		name: template.name,
		type: template.type,
		content: template.content,
		active: template.active,
	};
}
