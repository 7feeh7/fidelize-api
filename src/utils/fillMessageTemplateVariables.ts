export const MESSAGE_TEMPLATE_VARIABLE_KEYS = [
	"nome",
	"servico",
	"dias",
	"beneficio",
	"validade",
	"negocio",
] as const;

export type MessageTemplateVariableKey =
	(typeof MESSAGE_TEMPLATE_VARIABLE_KEYS)[number];

export type MessageTemplateVariableValues = Partial<
	Record<MessageTemplateVariableKey, string>
>;

export function extractFirstName(fullName: string): string {
	const trimmed = fullName.trim();
	if (!trimmed) {
		return "";
	}

	return trimmed.split(/\s+/)[0] ?? "";
}

export function fillMessageTemplateVariables(
	content: string,
	variables: MessageTemplateVariableValues,
): string {
	let result = content;

	for (const key of MESSAGE_TEMPLATE_VARIABLE_KEYS) {
		const value = variables[key] ?? "";
		result = result.replaceAll(`{${key}}`, value);
	}

	return result.replace(/\s{2,}/g, " ").trim();
}
