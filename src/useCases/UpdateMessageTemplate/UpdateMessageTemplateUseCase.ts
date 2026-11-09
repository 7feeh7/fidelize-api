import type { IMessageTemplatesRepository } from "@/repositories/IMessageTemplatesRepository";
import {
	normalizeMessageTemplateInput,
	validateMessageTemplateInput,
} from "@/utils/messageTemplateValidation";
import type { IUpdateMessageTemplateRequestDTO } from "./UpdateMessageTemplateDTO";

export class UpdateMessageTemplateUseCase {
	constructor(
		private messageTemplatesRepository: IMessageTemplatesRepository,
	) {}

	async execute(
		tenantId: string,
		data: IUpdateMessageTemplateRequestDTO,
	): Promise<void> {
		const existing = await this.messageTemplatesRepository.findById(
			tenantId,
			data.id,
		);

		if (!existing) {
			throw new Error("Modelo de mensagem não encontrado");
		}

		validateMessageTemplateInput({
			name: data.name,
			type: existing.type,
			content: data.content,
		});

		const normalized = normalizeMessageTemplateInput({
			name: data.name,
			type: existing.type,
			content: data.content,
		});

		existing.name = normalized.name;
		existing.content = normalized.content;

		await this.messageTemplatesRepository.update(tenantId, existing);
	}
}
