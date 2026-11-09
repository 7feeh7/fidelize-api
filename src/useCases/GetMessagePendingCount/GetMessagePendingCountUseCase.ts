import type { IMessagesRepository } from "@/repositories/IMessagesRepository";
import { getTodayDateOnly } from "@/utils/getTodayDateOnly";
import type { IGetMessagePendingCountResponseDTO } from "./GetMessagePendingCountDTO";

export class GetMessagePendingCountUseCase {
	constructor(private messagesRepository: IMessagesRepository) {}

	async execute(tenantId: string): Promise<IGetMessagePendingCountResponseDTO> {
		const pendingCount = await this.messagesRepository.countPendingUntil(
			tenantId,
			getTodayDateOnly(),
		);

		return { pendingCount };
	}
}
