import {
	MESSAGE_TEMPLATE_TYPES,
	type MessageTemplateType,
} from "@/entities/MessageTemplate";

export interface MessageTemplateInput {
	name: string;
	type: MessageTemplateType;
	content: string;
}

export function validateMessageTemplateInput(data: MessageTemplateInput): void {
	const name = data.name?.trim();
	if (!name) {
		throw new Error("Nome obrigatório");
	}

	if (name.length > 100) {
		throw new Error("Nome inválido");
	}

	if (!(MESSAGE_TEMPLATE_TYPES as readonly string[]).includes(data.type)) {
		throw new Error("Tipo inválido");
	}

	const content = data.content?.trim();
	if (!content) {
		throw new Error("Conteúdo obrigatório");
	}
}

export function normalizeMessageTemplateInput(
	data: MessageTemplateInput,
): MessageTemplateInput {
	return {
		name: data.name.trim(),
		type: data.type,
		content: data.content.trim(),
	};
}
