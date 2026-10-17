import type { MessageDTO } from "@/utils/mapMessageToDTO";

export interface IMarkMessageSentRequestDTO {
	id: string;
	loggedUserId: string;
}

export interface IMarkMessageSentResponseDTO {
	message: MessageDTO;
}
