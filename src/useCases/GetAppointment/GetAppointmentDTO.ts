export interface IGetAppointmentRequestDTO {
	id: string;
}

export interface IGetAppointmentResponseDTO {
	id: string;
	customerId: string;
	customerName: string;
	userId: string | null;
	userName: string | null;
	appointmentDate: string;
	subtotal: number;
	discountAmount: number;
	total: number;
	notes: string | null;
	usedReward: {
		id: string;
		ruleName: string;
		rewardType: string;
		rewardValue: number | null;
		freeServiceId: string | null;
		rewardSummary: string;
		preview: string;
	} | null;
	items: {
		id: string;
		serviceId: string;
		serviceName: string;
		price: number;
		returnDueDate: string | null;
	}[];
}
