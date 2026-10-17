import { Appointment } from "@/entities/Appointment";
import type { IAppointmentsRepository } from "@/repositories/IAppointmentsRepository";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { IServicesRepository } from "@/repositories/IServicesRepository";
import type { IUsersRepository } from "@/repositories/IUsersRepository";
import {
	computeSubtotal,
	computeTotal,
} from "@/utils/appointmentCalculations";
import {
	normalizeDiscountAmount,
	parseAppointmentDate,
	prepareAppointmentItems,
} from "@/utils/prepareAppointmentItems";
import type { IUpdateAppointmentRequestDTO } from "./UpdateAppointmentDTO";

export class UpdateAppointmentUseCase {
	constructor(
		private appointmentsRepository: IAppointmentsRepository,
		private customersRepository: ICustomersRepository,
		private servicesRepository: IServicesRepository,
		private usersRepository: IUsersRepository,
	) {}

	async execute(data: IUpdateAppointmentRequestDTO): Promise<void> {
		if (!data.customerId?.trim()) {
			throw new Error("Informe o cliente");
		}

		if (!data.loggedUserId?.trim()) {
			throw new Error("Usuário não identificado");
		}

		const existingAppointment = await this.appointmentsRepository.findById(
			data.id,
		);

		if (!existingAppointment) {
			throw new Error("Atendimento não encontrado");
		}

		const customer = await this.customersRepository.findActiveById(
			data.customerId,
		);

		if (!customer) {
			throw new Error("Cliente não encontrado");
		}

		const resolvedUserId = data.userId?.trim() || data.loggedUserId;
		const user = await this.usersRepository.findById(resolvedUserId);

		if (!user) {
			throw new Error("Usuário não encontrado");
		}

		const appointmentDate = parseAppointmentDate(data.appointmentDate);
		const discountAmount = normalizeDiscountAmount(data.discountAmount);
		const items = await prepareAppointmentItems(
			this.servicesRepository,
			appointmentDate,
			data.items,
		);
		const subtotal = computeSubtotal(items);

		if (discountAmount > subtotal) {
			throw new Error("O desconto não pode ser maior que o subtotal");
		}

		const total = computeTotal(subtotal, discountAmount);

		const appointment = new Appointment(
			{
				customerId: data.customerId,
				userId: resolvedUserId,
				appointmentDate,
				subtotal,
				discountAmount,
				total,
				notes: data.notes?.trim() ? data.notes.trim() : null,
			},
			data.id,
		);

		await this.appointmentsRepository.updateWithItems(appointment, items);
	}
}
