import type { IMessagesRepository } from "@/repositories/IMessagesRepository";
import { mapMessageToDTO } from "@/utils/mapMessageToDTO";
import type {
	IUpdateMessageContentRequestDTO,
	IUpdateMessageContentResponseDTO,
} from "./UpdateMessageContentDTO";

export class UpdateMessageContentUseCase {
	constructor(private messagesRepository: IMessagesRepository) {}

	async execute(
		data: IUpdateMessageContentRequestDTO,
	): Promise<IUpdateMessageContentResponseDTO> {
		const id = data.id?.trim();
		const content = data.content?.trim();

		if (!id) {
			throw new Error("Informe a mensagem");
		}

		if (!content) {
			throw new Error("Conteúdo obrigatório");
		}

		const message = await this.messagesRepository.findById(id);

		if (!message) {
			throw new Error("Mensagem não encontrada");
		}

		if (message.status !== "PENDING") {
			throw new Error("Somente mensagens pendentes podem ser editadas");
		}

		await this.messagesRepository.updateContent(id, content);

		const listItem = await this.messagesRepository.findListItemById(id);

		if (!listItem) {
			throw new Error("Não foi possível carregar a mensagem atualizada");
		}

		return {
			message: mapMessageToDTO(listItem),
		};
	}
}
