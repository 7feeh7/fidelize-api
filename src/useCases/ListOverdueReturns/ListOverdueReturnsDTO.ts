export interface IListOverdueReturnsRequestDTO {
	page?: number;
	perPage?: number;
}

export interface IListOverdueReturnsItemDTO {
	customerId: string;
	customerName: string;
	customerPhone: string;
	serviceName: string;
	appointmentDate: string;
	returnDueDate: string;
	overdueDays: number;
	additionalServicesCount: number;
}

export interface IListOverdueReturnsResponseDTO {
	data: IListOverdueReturnsItemDTO[];
	page: number;
	totalPages: number;
}
