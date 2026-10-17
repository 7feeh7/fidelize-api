import { Appointment } from "@/entities/Appointment";
import type { IAppointmentsRepository } from "@/repositories/IAppointmentsRepository";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { IReferralsRepository } from "@/repositories/IReferralsRepository";
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
import type { ICreateAppointmentRequestDTO } from "./CreateAppointmentDTO";

export class CreateAppointmentUseCase {
	constructor(
		private appointmentsRepository: IAppointmentsRepository,
		private customersRepository: ICustomersRepository,
		private servicesRepository: IServicesRepository,
		private usersRepository: IUsersRepository,
		private referralsRepository: IReferralsRepository,
	) {}

	async execute(data: ICreateAppointmentRequestDTO): Promise<void> {
		if (!data.customerId?.trim()) {
			throw new Error("Informe o cliente");
		}

		if (!data.loggedUserId?.trim()) {
			throw new Error("Usuário não identificado");
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

		const appointment = new Appointment({
			customerId: data.customerId,
			userId: resolvedUserId,
			appointmentDate,
			subtotal,
			discountAmount,
			total,
			notes: data.notes?.trim() ? data.notes.trim() : null,
		});

		await this.appointmentsRepository.saveWithItems(appointment, items);

		const appointmentCount =
			await this.appointmentsRepository.countByCustomerId(data.customerId);

		if (appointmentCount === 1) {
			await this.referralsRepository.convertPendingByReferredId(
				data.customerId,
				appointmentDate,
			);
		}
	}
}
