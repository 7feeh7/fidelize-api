import type { AppointmentItemInput } from "@/utils/prepareAppointmentItems";

export interface IUpdateAppointmentRequestDTO {
	id: string;
	customerId: string;
	appointmentDate: string;
	loggedUserId: string;
	userId?: string | null;
	discountAmount?: number;
	customerRewardId?: string | null;
	notes?: string | null;
	items: AppointmentItemInput[];
}
