import type { AppointmentItemInput } from "@/utils/prepareAppointmentItems";

export interface ICreateAppointmentRequestDTO {
	customerId: string;
	appointmentDate: string;
	loggedUserId: string;
	userId?: string | null;
	discountAmount?: number;
	notes?: string | null;
	items: AppointmentItemInput[];
}
