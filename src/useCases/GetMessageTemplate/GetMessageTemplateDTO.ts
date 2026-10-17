import type { MessageTemplateDTO } from "@/utils/mapMessageTemplateToDTO";

export interface IGetMessageTemplateRequestDTO {
	id: string;
}

export type IGetMessageTemplateResponseDTO = MessageTemplateDTO;
