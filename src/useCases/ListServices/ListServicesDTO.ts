export interface IListServicesItemDTO {
	id: string;
	name: string;
	description: string | null;
	price: number;
	durationMinutes: number | null;
	suggestedReturnDays: number | null;
	active: boolean;
}

export interface IListServicesResponseDTO {
	data: IListServicesItemDTO[];
}
