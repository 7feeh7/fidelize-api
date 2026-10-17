import { MESSAGE_STATUSES } from "@/entities/Message";
import { MESSAGE_TEMPLATE_TYPES } from "@/entities/MessageTemplate";
import type { IMessagesRepository } from "@/repositories/IMessagesRepository";
import { getTodayDateOnly } from "@/utils/getTodayDateOnly";
import { mapMessageToDTO } from "@/utils/mapMessageToDTO";
import type {
	IListMessagesRequestDTO,
	IListMessagesResponseDTO,
} from "./ListMessagesDTO";

export class ListMessagesUseCase {
	constructor(private messagesRepository: IMessagesRepository) {}

	async execute(
		data: IListMessagesRequestDTO,
	): Promise<IListMessagesResponseDTO> {
		if (data.status && !MESSAGE_STATUSES.includes(data.status)) {
			throw new Error("Status de mensagem inválido");
		}

		if (data.type && !MESSAGE_TEMPLATE_TYPES.includes(data.type)) {
			throw new Error("Tipo de mensagem inválido");
		}

		const today = getTodayDateOnly();
		const status = data.status ?? "PENDING";
		const scheduledUntil =
			data.scheduledUntil?.trim() ||
			(status === "PENDING" ? today : undefined);

		const items = await this.messagesRepository.list({
			status,
			type: data.type,
			customerId: data.customerId?.trim() || undefined,
			scheduledUntil,
			scheduledFrom: data.scheduledFrom?.trim() || undefined,
		});

		const pendingCount = await this.messagesRepository.countPendingUntil(today);

		return {
			data: items.map(mapMessageToDTO),
			pendingCount,
		};
	}
}
