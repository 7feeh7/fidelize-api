import type { Knex } from "knex";
import { roundMoney } from "@/utils/appointmentCalculations";
import type { IIndicatorsRepository } from "../IIndicatorsRepository";

export class PostgresIndicatorsRepository implements IIndicatorsRepository {
	constructor(private connection: Knex) {}

	async getTotals(tenantId: string, startDate: string, endDate: string) {
		const [appointmentsRow, customersRow, referralsRow] = await Promise.all([
			this.connection("appointments")
				.where({ tenant_id: tenantId })
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
				.where({ tenant_id: tenantId })
				.whereRaw("created_at::date >= ? and created_at::date <= ?", [
					startDate,
					endDate,
				])
				.count<{ count: string }>("id as count")
				.first(),
			this.connection("referrals")
				.where({ tenant_id: tenantId, status: "CONVERTED" })
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
