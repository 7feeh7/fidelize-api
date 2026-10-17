import type { IAppointmentsRepository } from "@/repositories/IAppointmentsRepository";
import type {
	IGetAppointmentRequestDTO,
	IGetAppointmentResponseDTO,
} from "./GetAppointmentDTO";

export class GetAppointmentUseCase {
	constructor(private appointmentsRepository: IAppointmentsRepository) {}

	async execute(
		data: IGetAppointmentRequestDTO,
	): Promise<IGetAppointmentResponseDTO> {
		const appointment = await this.appointmentsRepository.findDetailById(
			data.id,
		);

		if (!appointment) {
			throw new Error("Atendimento não encontrado");
		}

		return {
			id: appointment.id,
			customerId: appointment.customerId,
			customerName: appointment.customerName,
			userId: appointment.userId,
			userName: appointment.userName,
			appointmentDate: appointment.appointmentDate.toISOString(),
			subtotal: appointment.subtotal,
			discountAmount: appointment.discountAmount,
			total: appointment.total,
			notes: appointment.notes,
			items: appointment.items,
		};
	}
}
