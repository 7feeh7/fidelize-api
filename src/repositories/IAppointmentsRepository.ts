import type { Knex } from "knex";
import type { Appointment } from "@/entities/Appointment";
import type { AppointmentItem } from "@/entities/AppointmentItem";

export interface AppointmentListItem {
	id: string;
	customerId: string;
	customerName: string;
	userId: string | null;
	userName: string | null;
	appointmentDate: Date;
	subtotal: number;
	discountAmount: number;
	total: number;
}

export interface AppointmentItemDetail {
	id: string;
	serviceId: string;
	serviceName: string;
	price: number;
	returnDueDate: string | null;
}

export interface AppointmentDetail {
	id: string;
	customerId: string;
	customerName: string;
	userId: string | null;
	userName: string | null;
	appointmentDate: Date;
	subtotal: number;
	discountAmount: number;
	total: number;
	notes: string | null;
	items: AppointmentItemDetail[];
}

export interface ListAppointmentsParams {
	page: number;
	perPage: number;
	customerId?: string;
	startDate?: string;
	endDate?: string;
}

export interface ListAppointmentsResult {
	items: AppointmentListItem[];
	total: number;
}

export interface CustomerAppointmentStats {
	totalVisits: number;
	totalSpent: number;
	lastVisitDate: string | null;
}

export interface IAppointmentsRepository {
	saveWithItems(
		tenantId: string,
		appointment: Appointment,
		items: AppointmentItem[],
		trx?: Knex.Transaction,
	): Promise<void>;
	updateWithItems(
		tenantId: string,
		appointment: Appointment,
		items: AppointmentItem[],
		trx?: Knex.Transaction,
	): Promise<void>;
	findById(tenantId: string, id: string): Promise<Appointment | null>;
	findDetailById(
		tenantId: string,
		id: string,
	): Promise<AppointmentDetail | null>;
	list(
		tenantId: string,
		params: ListAppointmentsParams,
	): Promise<ListAppointmentsResult>;
	countByCustomerId(
		tenantId: string,
		customerId: string,
		trx?: Knex.Transaction,
	): Promise<number>;
	getStatsByCustomerId(
		tenantId: string,
		customerId: string,
	): Promise<CustomerAppointmentStats>;
}
