import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { IReturnRemindersRepository } from "@/repositories/IReturnRemindersRepository";
import { getTodayDateOnly } from "@/utils/getTodayDateOnly";
import type { IGetCustomerReturnSummaryResponseDTO } from "./GetCustomerReturnSummaryDTO";

export class GetCustomerReturnSummaryUseCase {
	constructor(
		private customersRepository: ICustomersRepository,
		private returnRemindersRepository: IReturnRemindersRepository,
	) {}

	async execute(
		customerId: string,
	): Promise<IGetCustomerReturnSummaryResponseDTO> {
		const normalizedCustomerId = customerId?.trim();

		if (!normalizedCustomerId) {
			throw new Error("Informe o cliente");
		}

		const customer =
			await this.customersRepository.findActiveById(normalizedCustomerId);

		if (!customer) {
			throw new Error("Cliente não encontrado");
		}

		const nextSuggestedReturnDate =
			await this.returnRemindersRepository.findNextSuggestedReturnDueDate(
				normalizedCustomerId,
				getTodayDateOnly(),
			);

		return { nextSuggestedReturnDate };
	}
}
