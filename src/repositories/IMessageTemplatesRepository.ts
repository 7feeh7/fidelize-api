import type {
	AutomaticMessageTemplateType,
	MessageTemplate,
} from "@/entities/MessageTemplate";

export interface IMessageTemplatesRepository {
	save(template: MessageTemplate): Promise<void>;
	findById(id: string): Promise<MessageTemplate | null>;
	findActiveAutomaticByType(
		type: AutomaticMessageTemplateType,
	): Promise<MessageTemplate | null>;
	listAll(): Promise<MessageTemplate[]>;
	update(template: MessageTemplate): Promise<void>;
	setActive(id: string, active: boolean): Promise<void>;
	deactivateActiveByAutomaticType(
		type: AutomaticMessageTemplateType,
		exceptId?: string,
	): Promise<void>;
}
