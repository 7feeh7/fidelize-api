export interface IListCustomersRequestDTO {
	page: number;
	perPage: number;
	search?: string;
}

export interface IListCustomersItemDTO {
	id: string;
	name: string;
	phone: string;
	dateOfBirth: string | null;
	leadSource: string;
}

export interface IListCustomersResponseDTO {
	data: IListCustomersItemDTO[];
	page: number;
	totalPages: number;
}
