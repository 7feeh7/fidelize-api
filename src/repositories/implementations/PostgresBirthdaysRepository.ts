import type { Knex } from "knex";
import { isBirthdayOnDate } from "@/utils/birthday";
import { normalizeDateOnly } from "@/utils/dateOnly";
import type {
	BirthdayCustomerRecord,
	IBirthdaysRepository,
} from "../IBirthdaysRepository";

function mapRowToRecord(row: Record<string, unknown>): BirthdayCustomerRecord {
	return {
		customerId: row.id as string,
		customerName: row.name as string,
		customerPhone: row.phone as string,
		dateOfBirth: normalizeDateOnly(row.date_of_birth) as string,
	};
}

export class PostgresBirthdaysRepository implements IBirthdaysRepository {
	constructor(private connection: Knex) {}

	async listCandidatesForDate(
		asOfDate: string,
	): Promise<BirthdayCustomerRecord[]> {
		const month = Number(asOfDate.slice(5, 7));
		const day = Number(asOfDate.slice(8, 10));

		const rows = await this.connection("customers")
			.where({ active: true })
			.whereNotNull("date_of_birth")
			.whereRaw("EXTRACT(MONTH FROM date_of_birth) = ?", [month])
			.where(function matchDay() {
				this.whereRaw("EXTRACT(DAY FROM date_of_birth) = ?", [day]);

				if (month === 2 && day === 28) {
					this.orWhereRaw(
						"EXTRACT(MONTH FROM date_of_birth) = 2 AND EXTRACT(DAY FROM date_of_birth) = 29",
					);
				}
			})
			.select("id", "name", "phone", "date_of_birth")
			.orderBy("name", "asc");

		return rows
			.map((row) => mapRowToRecord(row))
			.filter((record) => isBirthdayOnDate(record.dateOfBirth, asOfDate));
	}

	async listInMonth(
		_year: number,
		month: number,
	): Promise<BirthdayCustomerRecord[]> {
		const rows = await this.connection("customers")
			.where({ active: true })
			.whereNotNull("date_of_birth")
			.whereRaw("EXTRACT(MONTH FROM date_of_birth) = ?", [month])
			.select("id", "name", "phone", "date_of_birth")
			.orderByRaw("EXTRACT(DAY FROM date_of_birth) ASC")
			.orderBy("name", "asc");

		return rows.map((row) => mapRowToRecord(row));
	}
}
