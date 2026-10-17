import type { MessageDTO } from "@/utils/mapMessageToDTO";

export interface IUpdateMessageContentRequestDTO {
	id: string;
	content: string;
}

export interface IUpdateMessageContentResponseDTO {
	message: MessageDTO;
}
