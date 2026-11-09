import type { AutomaticMessageTemplateType } from "@/entities/MessageTemplate";

export const DEFAULT_MESSAGE_TEMPLATES: Array<{
	name: string;
	type: AutomaticMessageTemplateType;
	content: string;
}> = [
	{
		name: "Lembrete de retorno",
		type: "RETURN_REMINDER",
		content:
			"Oi {nome}! Já faz {dias} dias do seu {servico}. Que tal agendar um retorno no {negocio}? Estamos com saudades!",
	},
	{
		name: "Aniversário",
		type: "BIRTHDAY",
		content:
			"Oi {nome}! Feliz aniversário! O {negocio} preparou um presente especial para você: {beneficio}. Válido até {validade}.",
	},
];
