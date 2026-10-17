import type { IMessagesRepository } from "@/repositories/IMessagesRepository";
import type { IUsersRepository } from "@/repositories/IUsersRepository";
import { mapMessageToDTO } from "@/utils/mapMessageToDTO";
import type {
	IMarkMessageSentRequestDTO,
	IMarkMessageSentResponseDTO,
} from "./MarkMessageSentDTO";

export class MarkMessageSentUseCase {
	constructor(
		private messagesRepository: IMessagesRepository,
		private usersRepository: IUsersRepository,
	) {}

	async execute(
		data: IMarkMessageSentRequestDTO,
	): Promise<IMarkMessageSentResponseDTO> {
		const id = data.id?.trim();
		const loggedUserId = data.loggedUserId?.trim();

		if (!id) {
			throw new Error("Informe a mensagem");
		}

		if (!loggedUserId) {
			throw new Error("Informe o usuário logado");
		}

		const user = await this.usersRepository.findById(loggedUserId);

		if (!user) {
			throw new Error("Usuário não encontrado");
		}

		const message = await this.messagesRepository.findById(id);

		if (!message) {
			throw new Error("Mensagem não encontrada");
		}

		if (message.status !== "PENDING") {
			throw new Error("Somente mensagens pendentes podem ser marcadas como enviadas");
		}

		const sentAt = new Date();
		await this.messagesRepository.markSent(id, loggedUserId, sentAt);

		const listItem = await this.messagesRepository.findListItemById(id);

		if (!listItem) {
			throw new Error("Não foi possível carregar a mensagem atualizada");
		}

		return {
			message: mapMessageToDTO(listItem),
		};
	}
}
