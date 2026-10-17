import type { Knex } from "knex";
import { Appointment } from "@/entities/Appointment";
import { AppointmentItem } from "@/entities/AppointmentItem";
import type {
	AppointmentDetail,
	IAppointmentsRepository,
	ListAppointmentsParams,
	ListAppointmentsResult,
} from "../IAppointmentsRepository";

function mapRowToAppointment(row: Record<string, unknown>): Appointment {
	return new Appointment(
		{
			customerId: row.customer_id as string,
			userId: (row.user_id as string | null) ?? null,
			appointmentDate: new Date(row.appointment_date as string),
			subtotal: Number(row.subtotal),
			discountAmount: Number(row.discount_amount),
			total: Number(row.total),
			notes: (row.notes as string | null) ?? null,
		},
		row.id as string,
	);
}

export class PostgresAppointmentsRepository implements IAppointmentsRepository {
	constructor(private connection: Knex) {}

	async saveWithItems(
		appointment: Appointment,
		items: AppointmentItem[],
		trx?: Knex.Transaction,
	): Promise<void> {
		const persist = async (executor: Knex.Transaction) => {
			await executor("appointments").insert({
				id: appointment.id,
				customer_id: appointment.customerId,
				user_id: appointment.userId,
				appointment_date: appointment.appointmentDate,
				subtotal: appointment.subtotal,
				discount_amount: appointment.discountAmount,
				total: appointment.total,
				notes: appointment.notes,
			});

			if (items.length > 0) {
				await executor("appointment_items").insert(
					items.map((item) => ({
						id: item.id,
						appointment_id: appointment.id,
						service_id: item.serviceId,
						price: item.price,
						return_due_date: item.returnDueDate,
					})),
				);
			}
		};

		if (trx) {
			await persist(trx);
			return;
		}

		await this.connection.transaction(persist);
	}

	async updateWithItems(
		appointment: Appointment,
		items: AppointmentItem[],
	): Promise<void> {
		await this.connection.transaction(async (trx) => {
			await trx("appointments")
				.where({ id: appointment.id })
				.update({
					customer_id: appointment.customerId,
					user_id: appointment.userId,
					appointment_date: appointment.appointmentDate,
					subtotal: appointment.subtotal,
					discount_amount: appointment.discountAmount,
					total: appointment.total,
					notes: appointment.notes,
					updated_at: trx.fn.now(),
				});

			await trx("appointment_items")
				.where({ appointment_id: appointment.id })
				.delete();

			if (items.length > 0) {
				await trx("appointment_items").insert(
					items.map((item) => ({
						id: item.id,
						appointment_id: appointment.id,
						service_id: item.serviceId,
						price: item.price,
						return_due_date: item.returnDueDate,
					})),
				);
			}
		});
	}

	async findById(id: string): Promise<Appointment | null> {
		const row = await this.connection("appointments").where({ id }).first();

		if (!row) {
			return null;
		}

		return mapRowToAppointment(row);
	}

	async findDetailById(id: string): Promise<AppointmentDetail | null> {
		const row = await this.connection("appointments as a")
			.leftJoin("customers as c", "c.id", "a.customer_id")
			.leftJoin("users as u", "u.id", "a.user_id")
			.where("a.id", id)
			.select(
				"a.*",
				"c.name as customer_name",
				"u.name as user_name",
			)
			.first();

		if (!row) {
			return null;
		}

		const itemRows = await this.connection("appointment_items as ai")
			.join("services as s", "s.id", "ai.service_id")
			.where("ai.appointment_id", id)
			.select(
				"ai.id",
				"ai.service_id",
				"s.name as service_name",
				"ai.price",
				"ai.return_due_date",
			)
			.orderBy("s.name", "asc");

		return {
			id: row.id as string,
			customerId: row.customer_id as string,
			customerName: row.customer_name as string,
			userId: (row.user_id as string | null) ?? null,
			userName: (row.user_name as string | null) ?? null,
			appointmentDate: new Date(row.appointment_date as string),
			subtotal: Number(row.subtotal),
			discountAmount: Number(row.discount_amount),
			total: Number(row.total),
			notes: (row.notes as string | null) ?? null,
			items: itemRows.map((item) => ({
				id: item.id as string,
				serviceId: item.service_id as string,
				serviceName: item.service_name as string,
				price: Number(item.price),
				returnDueDate: (item.return_due_date as string | null) ?? null,
			})),
		};
	}

	async list({
		page,
		perPage,
		customerId,
		startDate,
		endDate,
	}: ListAppointmentsParams): Promise<ListAppointmentsResult> {
		const buildQuery = () => {
			const query = this.connection("appointments as a")
				.join("customers as c", "c.id", "a.customer_id")
				.leftJoin("users as u", "u.id", "a.user_id");

			if (customerId) {
				query.where("a.customer_id", customerId);
			}

			if (startDate) {
				query.where("a.appointment_date", ">=", startDate);
			}

			if (endDate) {
				query.where("a.appointment_date", "<=", endDate);
			}

			return query;
		};

		const countRow = await buildQuery()
			.count<{ count: string }>("a.id as count")
			.first();
		const total = Number(countRow?.count ?? 0);

		const rows = await buildQuery()
			.select(
				"a.id",
				"a.customer_id",
				"c.name as customer_name",
				"a.user_id",
				"u.name as user_name",
				"a.appointment_date",
				"a.subtotal",
				"a.discount_amount",
				"a.total",
			)
			.orderBy("a.appointment_date", "desc")
			.limit(perPage)
			.offset((page - 1) * perPage);

		return {
			total,
			items: rows.map((row) => ({
				id: row.id as string,
				customerId: row.customer_id as string,
				customerName: row.customer_name as string,
				userId: (row.user_id as string | null) ?? null,
				userName: (row.user_name as string | null) ?? null,
				appointmentDate: new Date(row.appointment_date as string),
				subtotal: Number(row.subtotal),
				discountAmount: Number(row.discount_amount),
				total: Number(row.total),
			})),
		};
	}

	async countByCustomerId(
		customerId: string,
		trx?: Knex.Transaction,
	): Promise<number> {
		const executor = trx ?? this.connection;
		const row = await executor("appointments")
			.where({ customer_id: customerId })
			.count<{ count: string }>("id as count")
			.first();

		return Number(row?.count ?? 0);
	}
}
