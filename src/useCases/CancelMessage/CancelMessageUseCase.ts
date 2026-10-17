import type { IMessagesRepository } from "@/repositories/IMessagesRepository";

export class CancelMessageUseCase {
	constructor(private messagesRepository: IMessagesRepository) {}

	async execute(id: string): Promise<void> {
		const messageId = id?.trim();

		if (!messageId) {
			throw new Error("Informe a mensagem");
		}

		const message = await this.messagesRepository.findById(messageId);

		if (!message) {
			throw new Error("Mensagem não encontrada");
		}

		if (message.status !== "PENDING") {
			throw new Error("Somente mensagens pendentes podem ser descartadas");
		}

		await this.messagesRepository.cancel(messageId);
	}
}
