import type { Knex } from "knex";
import { roundMoney } from "@/utils/appointmentCalculations";
import type { IIndicatorsRepository } from "../IIndicatorsRepository";

export class PostgresIndicatorsRepository implements IIndicatorsRepository {
	constructor(private connection: Knex) {}

	async getTotals(startDate: string, endDate: string) {
		const [appointmentsRow, customersRow, referralsRow] = await Promise.all([
			this.connection("appointments")
				.whereRaw(
					"appointment_date::date >= ? and appointment_date::date <= ?",
					[startDate, endDate],
				)
				.select(
					this.connection.raw("count(*)::int as appointments_count"),
					this.connection.raw("coalesce(sum(total), 0) as billed_amount"),
				)
				.first(),
			this.connection("customers")
				.whereRaw("created_at::date >= ? and created_at::date <= ?", [
					startDate,
					endDate,
				])
				.count<{ count: string }>("id as count")
				.first(),
			this.connection("referrals")
				.where({ status: "CONVERTED" })
				.whereRaw("converted_at::date >= ? and converted_at::date <= ?", [
					startDate,
					endDate,
				])
				.count<{ count: string }>("id as count")
				.first(),
		]);

		return {
			appointmentsCount: Number(appointmentsRow?.appointments_count ?? 0),
			billedAmount: roundMoney(Number(appointmentsRow?.billed_amount ?? 0)),
			newCustomersCount: Number(customersRow?.count ?? 0),
			convertedReferralsCount: Number(referralsRow?.count ?? 0),
		};
	}
}
