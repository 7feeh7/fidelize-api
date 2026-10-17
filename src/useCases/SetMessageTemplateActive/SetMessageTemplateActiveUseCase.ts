import { isAutomaticMessageTemplateType } from "@/entities/MessageTemplate";
import type { IMessageTemplatesRepository } from "@/repositories/IMessageTemplatesRepository";
import type { ISetMessageTemplateActiveRequestDTO } from "./SetMessageTemplateActiveDTO";

export class SetMessageTemplateActiveUseCase {
	constructor(
		private messageTemplatesRepository: IMessageTemplatesRepository,
	) {}

	async execute(data: ISetMessageTemplateActiveRequestDTO): Promise<void> {
		if (typeof data.active !== "boolean") {
			throw new Error("Status inválido");
		}

		const existing = await this.messageTemplatesRepository.findById(data.id);

		if (!existing) {
			throw new Error("Modelo de mensagem não encontrado");
		}

		if (existing.active === data.active) {
			return;
		}

		if (data.active && isAutomaticMessageTemplateType(existing.type)) {
			await this.messageTemplatesRepository.deactivateActiveByAutomaticType(
				existing.type,
				existing.id,
			);
		}

		await this.messageTemplatesRepository.setActive(data.id, data.active);
	}
}
