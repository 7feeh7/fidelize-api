import type { IAppointmentsRepository } from "@/repositories/IAppointmentsRepository";
import type {
	IListAppointmentsRequestDTO,
	IListAppointmentsResponseDTO,
} from "./ListAppointmentsDTO";

export class ListAppointmentsUseCase {
	constructor(private appointmentsRepository: IAppointmentsRepository) {}

	async execute(
		data: IListAppointmentsRequestDTO,
	): Promise<IListAppointmentsResponseDTO> {
		const page = data.page < 1 ? 1 : data.page;
		const perPage = data.perPage < 1 ? 10 : data.perPage;

		const { items, total } = await this.appointmentsRepository.list({
			page,
			perPage,
			customerId: data.customerId,
			startDate: data.startDate,
			endDate: data.endDate,
		});

		const totalPages = total === 0 ? 0 : Math.ceil(total / perPage);

		return {
			data: items.map((item) => ({
				id: item.id,
				customerId: item.customerId,
				customerName: item.customerName,
				userId: item.userId,
				userName: item.userName,
				appointmentDate: item.appointmentDate.toISOString(),
				subtotal: item.subtotal,
				discountAmount: item.discountAmount,
				total: item.total,
			})),
			page,
			totalPages,
		};
	}
}
