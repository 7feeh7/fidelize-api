export interface IListServicesItemDTO {
	id: string;
	name: string;
	price: number;
	suggestedReturnDays: number | null;
	active: boolean;
}

export interface IListServicesResponseDTO {
	data: IListServicesItemDTO[];
}
