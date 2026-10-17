import type { MessageDTO } from "@/utils/mapMessageToDTO";

export interface ICreateCustomerMessageRequestDTO {
	customerId: string;
	templateId?: string;
	content?: string;
	scheduledFor?: string;
}

export interface ICreateCustomerMessageResponseDTO {
	message: MessageDTO;
}
