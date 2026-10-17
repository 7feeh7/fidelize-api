import type { MessageTemplateType } from "./MessageTemplate";

export const MESSAGE_STATUSES = ["PENDING", "SENT", "CANCELED"] as const;

export type MessageStatus = (typeof MESSAGE_STATUSES)[number];

export class Message {
	readonly id?: string;
	public customerId!: string;
	public templateId!: string | null;
	public appointmentItemId!: string | null;
	public customerRewardId!: string | null;
	public type!: MessageTemplateType;
	public content!: string;
	public status!: MessageStatus;
	public scheduledFor!: string;
	public sentAt!: Date | null;
	public sentBy!: string | null;
	public createdAt!: Date;

	constructor(props: Omit<Message, "id">, id?: string) {
		Object.assign(this, props);
		this.id = id ?? crypto.randomUUID();
	}
}
