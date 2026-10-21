import type { IReturnRemindersRepository } from "@/repositories/IReturnRemindersRepository";
import { daysBetweenDateOnly, normalizeDateOnly } from "@/utils/dateOnly";
import { getTodayDateOnly } from "@/utils/getTodayDateOnly";
import type {
	IListOverdueReturnsRequestDTO,
	IListOverdueReturnsResponseDTO,
} from "./ListOverdueReturnsDTO";

export const LIST_OVERDUE_RETURNS_MAX_PER_PAGE = 5;

export class ListOverdueReturnsUseCase {
	constructor(
		private returnRemindersRepository: IReturnRemindersRepository,
	) {}

	async execute(
		data: IListOverdueReturnsRequestDTO = {},
		referenceDate = new Date(),
	): Promise<IListOverdueReturnsResponseDTO> {
		const page = !data.page || data.page < 1 ? 1 : data.page;
		const requestedPerPage =
			!data.perPage || data.perPage < 1 ? LIST_OVERDUE_RETURNS_MAX_PER_PAGE : data.perPage;
		const perPage = Math.min(
			requestedPerPage,
			LIST_OVERDUE_RETURNS_MAX_PER_PAGE,
		);
		const asOfDate = getTodayDateOnly(referenceDate);

		const { items, total } =
			await this.returnRemindersRepository.listOverdueWithoutContactAfterAppointment(
				asOfDate,
				page,
				perPage,
			);

		const totalPages = total === 0 ? 0 : Math.ceil(total / perPage);

		return {
			data: items.map((item) => {
				const appointmentDate = normalizeDateOnly(item.appointmentDate);
				const returnDueDate = normalizeDateOnly(item.returnDueDate);

				return {
					customerId: item.customerId,
					customerName: item.customerName,
					customerPhone: item.customerPhone,
					serviceName: item.serviceName,
					appointmentDate: appointmentDate ?? "",
					returnDueDate: returnDueDate ?? "",
					overdueDays:
						returnDueDate != null
							? daysBetweenDateOnly(returnDueDate, asOfDate)
							: 0,
					additionalServicesCount: item.additionalServicesCount,
				};
			}),
			page,
			totalPages,
		};
	}
}
