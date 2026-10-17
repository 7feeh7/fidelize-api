import {
	isAutomaticMessageTemplateType,
	MessageTemplate,
} from "@/entities/MessageTemplate";
import type { IMessageTemplatesRepository } from "@/repositories/IMessageTemplatesRepository";
import {
	normalizeMessageTemplateInput,
	validateMessageTemplateInput,
} from "@/utils/messageTemplateValidation";
import type { ICreateMessageTemplateRequestDTO } from "./CreateMessageTemplateDTO";

export class CreateMessageTemplateUseCase {
	constructor(
		private messageTemplatesRepository: IMessageTemplatesRepository,
	) {}

	async execute(data: ICreateMessageTemplateRequestDTO): Promise<void> {
		validateMessageTemplateInput(data);
		const normalized = normalizeMessageTemplateInput(data);

		const template = new MessageTemplate({
			...normalized,
			active: true,
		});

		if (isAutomaticMessageTemplateType(template.type)) {
			await this.messageTemplatesRepository.deactivateActiveByAutomaticType(
				template.type,
			);
		}

		await this.messageTemplatesRepository.save(template);
	}
}
