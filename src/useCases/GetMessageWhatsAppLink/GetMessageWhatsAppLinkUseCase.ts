import type { IMessagesRepository } from "@/repositories/IMessagesRepository";
import { buildWhatsAppLink } from "@/utils/buildWhatsAppLink";
import type { IGetMessageWhatsAppLinkResponseDTO } from "./GetMessageWhatsAppLinkDTO";

export class GetMessageWhatsAppLinkUseCase {
	constructor(private messagesRepository: IMessagesRepository) {}

	async execute(id: string): Promise<IGetMessageWhatsAppLinkResponseDTO> {
		const messageId = id?.trim();

		if (!messageId) {
			throw new Error("Informe a mensagem");
		}

		const listItem = await this.messagesRepository.findListItemById(messageId);

		if (!listItem) {
			throw new Error("Mensagem não encontrada");
		}

		if (listItem.message.status !== "PENDING") {
			throw new Error("Somente mensagens pendentes possuem link de envio");
		}

		const whatsappUrl = buildWhatsAppLink(
			listItem.customerPhone,
			listItem.message.content,
		);

		if (!whatsappUrl) {
			throw new Error("Telefone do cliente inválido para WhatsApp");
		}

		return { whatsappUrl };
	}
}
