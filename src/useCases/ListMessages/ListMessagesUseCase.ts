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
		const customerId = data.customerId?.trim() || undefined;
		const isCustomerHistory = Boolean(customerId);
		const status = data.status ?? (isCustomerHistory ? undefined : "PENDING");
		const scheduledUntil =
			data.scheduledUntil?.trim() ||
			(!isCustomerHistory && status === "PENDING" ? today : undefined);
		const page = data.page != null && data.page > 0 ? data.page : undefined;
		const perPage =
			data.perPage != null && data.perPage > 0 ? data.perPage : undefined;

		const { items, total } = await this.messagesRepository.list({
			status,
			type: data.type,
			customerId,
			scheduledUntil,
			scheduledFrom: data.scheduledFrom?.trim() || undefined,
			page,
			perPage,
			sort: isCustomerHistory ? "recent_desc" : "scheduled_asc",
		});

		const pendingCount = await this.messagesRepository.countPendingUntil(today);
		const resolvedPage = page ?? 1;
		const resolvedPerPage = perPage ?? Math.max(total, 1);
		const totalPages = total === 0 ? 0 : Math.ceil(total / resolvedPerPage);

		return {
			data: items.map(mapMessageToDTO),
			pendingCount,
			page: resolvedPage,
			totalPages,
		};
	}
}
