import type { IMessageTemplatesRepository } from "@/repositories/IMessageTemplatesRepository";
import { mapMessageTemplateToDTO } from "@/utils/mapMessageTemplateToDTO";
import type { IListMessageTemplatesResponseDTO } from "./ListMessageTemplatesDTO";

export class ListMessageTemplatesUseCase {
	constructor(
		private messageTemplatesRepository: IMessageTemplatesRepository,
	) {}

	async execute(): Promise<IListMessageTemplatesResponseDTO> {
		const templates = await this.messageTemplatesRepository.listAll();

		return {
			data: templates.map((template) => mapMessageTemplateToDTO(template)),
		};
	}
}
