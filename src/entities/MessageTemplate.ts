export const MESSAGE_TEMPLATE_TYPES = [
	"RETURN_REMINDER",
	"BIRTHDAY",
	"REWARD_EXPIRING",
	"CUSTOM",
] as const;

export type MessageTemplateType = (typeof MESSAGE_TEMPLATE_TYPES)[number];

export const AUTOMATIC_MESSAGE_TEMPLATE_TYPES = [
	"RETURN_REMINDER",
	"BIRTHDAY",
	"REWARD_EXPIRING",
] as const;

export type AutomaticMessageTemplateType =
	(typeof AUTOMATIC_MESSAGE_TEMPLATE_TYPES)[number];

export function isAutomaticMessageTemplateType(
	type: MessageTemplateType,
): type is AutomaticMessageTemplateType {
	return (AUTOMATIC_MESSAGE_TEMPLATE_TYPES as readonly string[]).includes(type);
}

export class MessageTemplate {
	readonly id?: string;
	public name!: string;
	public type!: MessageTemplateType;
	public content!: string;
	public active!: boolean;

	constructor(props: Omit<MessageTemplate, "id">, id?: string) {
		Object.assign(this, props);
		this.id = id ?? crypto.randomUUID();
		if (this.active === undefined) {
			this.active = true;
		}
	}
}
