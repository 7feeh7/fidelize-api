import { Message } from "@/entities/Message";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { IMessagesRepository } from "@/repositories/IMessagesRepository";
import type { IMessageTemplatesRepository } from "@/repositories/IMessageTemplatesRepository";
import type { FillMessageTemplateService } from "@/services/FillMessageTemplateService";
import { getTodayDateOnly } from "@/utils/getTodayDateOnly";
import { mapMessageToDTO } from "@/utils/mapMessageToDTO";
import type {
	ICreateCustomerMessageRequestDTO,
	ICreateCustomerMessageResponseDTO,
} from "./CreateCustomerMessageDTO";

export class CreateCustomerMessageUseCase {
	constructor(
		private customersRepository: ICustomersRepository,
		private messageTemplatesRepository: IMessageTemplatesRepository,
		private messagesRepository: IMessagesRepository,
		private fillMessageTemplateService: FillMessageTemplateService,
	) {}

	async execute(
		data: ICreateCustomerMessageRequestDTO,
	): Promise<ICreateCustomerMessageResponseDTO> {
		const customerId = data.customerId?.trim();

		if (!customerId) {
			throw new Error("Informe o cliente");
		}

		const customer = await this.customersRepository.findActiveById(customerId);

		if (!customer) {
			throw new Error("Cliente não encontrado");
		}

		const templateId = data.templateId?.trim();
		let content = data.content?.trim();
		let resolvedTemplateId: string | null = null;

		if (templateId) {
			const template =
				await this.messageTemplatesRepository.findById(templateId);

			if (!template) {
				throw new Error("Modelo de mensagem não encontrado");
			}

			content = await this.fillMessageTemplateService.execute(
				template.content,
				customerId,
			);
			resolvedTemplateId = templateId;
		}

		if (!content) {
			throw new Error("Informe o texto ou selecione um modelo");
		}

		const scheduledFor = data.scheduledFor?.trim() || getTodayDateOnly();

		const message = new Message({
			customerId,
			templateId: resolvedTemplateId,
			appointmentItemId: null,
			customerRewardId: null,
			type: "CUSTOM",
			content,
			status: "PENDING",
			scheduledFor,
			sentAt: null,
			sentBy: null,
			createdAt: new Date(),
		});

		await this.messagesRepository.save(message);

		const listItem = await this.messagesRepository.findListItemById(
			message.id as string,
		);

		if (!listItem) {
			throw new Error("Não foi possível carregar a mensagem criada");
		}

		return {
			message: mapMessageToDTO(listItem),
		};
	}
}
