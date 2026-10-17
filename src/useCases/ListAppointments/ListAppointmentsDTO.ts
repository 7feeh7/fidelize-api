export interface IListAppointmentsRequestDTO {
	page: number;
	perPage: number;
	customerId?: string;
	startDate?: string;
	endDate?: string;
}

export interface IListAppointmentsResponseDTO {
	data: {
		id: string;
		customerId: string;
		customerName: string;
		userId: string | null;
		userName: string | null;
		appointmentDate: string;
		subtotal: number;
		discountAmount: number;
		total: number;
	}[];
	page: number;
	totalPages: number;
}
