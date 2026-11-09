import { isAutomaticMessageTemplateType } from "@/entities/MessageTemplate";
import type { IMessageTemplatesRepository } from "@/repositories/IMessageTemplatesRepository";
import type { ISetMessageTemplateActiveRequestDTO } from "./SetMessageTemplateActiveDTO";

export class SetMessageTemplateActiveUseCase {
	constructor(
		private messageTemplatesRepository: IMessageTemplatesRepository,
	) {}

	async execute(
		tenantId: string,
		data: ISetMessageTemplateActiveRequestDTO,
	): Promise<void> {
		if (typeof data.active !== "boolean") {
			throw new Error("Status inválido");
		}

		const existing = await this.messageTemplatesRepository.findById(
			tenantId,
			data.id,
		);

		if (!existing) {
			throw new Error("Modelo de mensagem não encontrado");
		}

		if (existing.active === data.active) {
			return;
		}

		if (data.active && isAutomaticMessageTemplateType(existing.type)) {
			await this.messageTemplatesRepository.deactivateActiveByAutomaticType(
				tenantId,
				existing.type,
				existing.id,
			);
		}

		await this.messageTemplatesRepository.setActive(
			tenantId,
			data.id,
			data.active,
		);
	}
}
