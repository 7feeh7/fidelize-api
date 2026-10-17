export interface IPreviewMessageTemplateRequestDTO {
	content?: string;
	templateId?: string;
	customerId?: string;
}

export interface IPreviewMessageTemplateResponseDTO {
	preview: string;
}
