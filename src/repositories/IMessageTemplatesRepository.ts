import type {
	AutomaticMessageTemplateType,
	MessageTemplate,
} from "@/entities/MessageTemplate";

export interface IMessageTemplatesRepository {
	save(tenantId: string, template: MessageTemplate): Promise<void>;
	findById(tenantId: string, id: string): Promise<MessageTemplate | null>;
	findActiveAutomaticByType(
		tenantId: string,
		type: AutomaticMessageTemplateType,
	): Promise<MessageTemplate | null>;
	listAll(tenantId: string): Promise<MessageTemplate[]>;
	update(tenantId: string, template: MessageTemplate): Promise<void>;
	setActive(tenantId: string, id: string, active: boolean): Promise<void>;
	deactivateActiveByAutomaticType(
		tenantId: string,
		type: AutomaticMessageTemplateType,
		exceptId?: string,
	): Promise<void>;
}
