import type { IBirthdaysRepository } from "@/repositories/IBirthdaysRepository";
import { computeAge } from "@/utils/birthday";
import { getTodayDateOnly } from "@/utils/getTodayDateOnly";
import type {
	IListMonthlyBirthdaysRequestDTO,
	IListMonthlyBirthdaysResponseDTO,
} from "./ListMonthlyBirthdaysDTO";

export class ListMonthlyBirthdaysUseCase {
	constructor(private birthdaysRepository: IBirthdaysRepository) {}

	async execute(
		data: IListMonthlyBirthdaysRequestDTO = {},
	): Promise<IListMonthlyBirthdaysResponseDTO> {
		const today = getTodayDateOnly();
		const defaultYear = Number(today.slice(0, 4));
		const defaultMonth = Number(today.slice(5, 7));
		const year = data.year ?? defaultYear;
		const month = data.month ?? defaultMonth;

		if (!Number.isInteger(year) || year < 1900 || year > 2200) {
			throw new Error("Ano inválido");
		}

		if (!Number.isInteger(month) || month < 1 || month > 12) {
			throw new Error("Mês inválido");
		}

		const records = await this.birthdaysRepository.listInMonth(year, month);
		const ageReferenceDate = getTodayDateOnly();

		return {
			year,
			month,
			data: records.map((record) => ({
				id: record.customerId,
				name: record.customerName,
				phone: record.customerPhone,
				dateOfBirth: record.dateOfBirth,
				age: computeAge(record.dateOfBirth, ageReferenceDate),
			})),
		};
	}
}
