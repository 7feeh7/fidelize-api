import type { IMessageTemplatesRepository } from "@/repositories/IMessageTemplatesRepository";
import { mapMessageTemplateToDTO } from "@/utils/mapMessageTemplateToDTO";
import type {
	IGetMessageTemplateRequestDTO,
	IGetMessageTemplateResponseDTO,
} from "./GetMessageTemplateDTO";

export class GetMessageTemplateUseCase {
	constructor(
		private messageTemplatesRepository: IMessageTemplatesRepository,
	) {}

	async execute(
		tenantId: string,
		data: IGetMessageTemplateRequestDTO,
	): Promise<IGetMessageTemplateResponseDTO> {
		const template = await this.messageTemplatesRepository.findById(
			tenantId,
			data.id,
		);

		if (!template) {
			throw new Error("Modelo de mensagem não encontrado");
		}

		return mapMessageTemplateToDTO(template);
	}
}
