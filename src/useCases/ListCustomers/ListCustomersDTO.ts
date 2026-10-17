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
	referrerId: string | null;
	referrerName: string | null;
	referralsMadeCount: number;
}

export interface IListCustomersResponseDTO {
	data: IListCustomersItemDTO[];
	page: number;
	totalPages: number;
}
