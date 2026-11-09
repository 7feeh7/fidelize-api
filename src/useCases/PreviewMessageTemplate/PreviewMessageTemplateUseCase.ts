import type { IMessageTemplatesRepository } from "@/repositories/IMessageTemplatesRepository";
import type { FillMessageTemplateService } from "@/services/FillMessageTemplateService";
import type {
	IPreviewMessageTemplateRequestDTO,
	IPreviewMessageTemplateResponseDTO,
} from "./PreviewMessageTemplateDTO";

export class PreviewMessageTemplateUseCase {
	constructor(
		private messageTemplatesRepository: IMessageTemplatesRepository,
		private fillMessageTemplateService: FillMessageTemplateService,
	) {}

	async execute(
		tenantId: string,
		data: IPreviewMessageTemplateRequestDTO,
	): Promise<IPreviewMessageTemplateResponseDTO> {
		let content = data.content?.trim();

		if (!content && data.templateId) {
			const template = await this.messageTemplatesRepository.findById(
				tenantId,
				data.templateId,
			);

			if (!template) {
				throw new Error("Modelo de mensagem não encontrado");
			}

			content = template.content;
		}

		if (!content) {
			throw new Error("Conteúdo obrigatório");
		}

		const preview = await this.fillMessageTemplateService.execute(
			tenantId,
			content,
			data.customerId,
		);

		return { preview };
	}
}
