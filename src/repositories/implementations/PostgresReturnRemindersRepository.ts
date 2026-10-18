import type { Knex } from "knex";
import { subtractDaysFromDateOnly } from "@/utils/dateOnly";
import type {
	IReturnRemindersRepository,
	ReturnReminderCandidate,
} from "../IReturnRemindersRepository";

function mapRowToCandidate(
	row: Record<string, unknown>,
): ReturnReminderCandidate {
	return {
		appointmentItemId: row.appointment_item_id as string,
		customerId: row.customer_id as string,
		customerName: row.customer_name as string,
		serviceName: row.service_name as string,
		appointmentDate: row.appointment_date as string,
		returnDueDate: row.return_due_date as string,
	};
}

export class PostgresReturnRemindersRepository
	implements IReturnRemindersRepository
{
	constructor(private connection: Knex) {}

	private openReturnObligationsQuery() {
		return this.connection("appointment_items as ai")
			.join("appointments as a", "a.id", "ai.appointment_id")
			.join("customers as c", "c.id", "a.customer_id")
			.join("services as s", "s.id", "ai.service_id")
			.where("c.active", true)
			.whereNotNull("ai.return_due_date")
			.whereRaw(`
				NOT EXISTS (
					SELECT 1
					FROM appointment_items ai2
					INNER JOIN appointments a2 ON a2.id = ai2.appointment_id
					WHERE a2.customer_id = a.customer_id
						AND ai2.service_id = ai.service_id
						AND a2.appointment_date > a.appointment_date
				)
			`);
	}

	async listEligibleForReminders(
		asOfDate: string,
		maxOverdueDays: number,
	): Promise<ReturnReminderCandidate[]> {
		const earliestReturnDueDate = subtractDaysFromDateOnly(
			asOfDate,
			maxOverdueDays,
		);

		const rows = await this.openReturnObligationsQuery()
			.where("ai.return_due_date", "<=", asOfDate)
			.where("ai.return_due_date", ">=", earliestReturnDueDate)
			.whereRaw(`
				NOT EXISTS (
					SELECT 1
					FROM messages m
					WHERE m.appointment_item_id = ai.id
				)
			`)
			.select(
				"ai.id as appointment_item_id",
				"a.customer_id",
				"c.name as customer_name",
				"s.name as service_name",
				this.connection.raw("a.appointment_date::date as appointment_date"),
				"ai.return_due_date",
			)
			.orderBy("ai.return_due_date", "asc")
			.orderBy("a.appointment_date", "asc");

		return rows.map((row) => mapRowToCandidate(row));
	}

	async findNextSuggestedReturnDueDate(
		customerId: string,
		_asOfDate: string,
	): Promise<string | null> {
		const row = await this.openReturnObligationsQuery()
			.where("a.customer_id", customerId)
			.select("ai.return_due_date")
			.orderBy("ai.return_due_date", "asc")
			.first();

		return (row?.return_due_date as string | undefined) ?? null;
	}
}
