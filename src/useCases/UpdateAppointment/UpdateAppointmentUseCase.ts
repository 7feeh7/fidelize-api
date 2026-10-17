import type { Knex } from "knex";
import { Appointment } from "@/entities/Appointment";
import { PostgresAppointmentsRepository } from "@/repositories/implementations/PostgresAppointmentsRepository";
import { PostgresCustomerRewardsRepository } from "@/repositories/implementations/PostgresCustomerRewardsRepository";
import type { IAppointmentsRepository } from "@/repositories/IAppointmentsRepository";
import type { ICustomerRewardsRepository } from "@/repositories/ICustomerRewardsRepository";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { IServicesRepository } from "@/repositories/IServicesRepository";
import type { IUsersRepository } from "@/repositories/IUsersRepository";
import { CustomerRewardUsageService } from "@/services/CustomerRewardUsageService";
import {
	computeSubtotal,
	computeTotal,
} from "@/utils/appointmentCalculations";
import {
	parseAppointmentDate,
	prepareAppointmentItems,
} from "@/utils/prepareAppointmentItems";
import { resolveAppointmentCustomerReward } from "@/utils/resolveAppointmentCustomerReward";
import { syncAppointmentCustomerReward } from "@/utils/syncAppointmentCustomerReward";
import type { IUpdateAppointmentRequestDTO } from "./UpdateAppointmentDTO";

export class UpdateAppointmentUseCase {
	constructor(
		private appointmentsRepository: IAppointmentsRepository,
		private customersRepository: ICustomersRepository,
		private servicesRepository: IServicesRepository,
		private usersRepository: IUsersRepository,
		private customerRewardsRepository: ICustomerRewardsRepository,
		private connection: Knex,
		private rewardUsageServiceForTests?: CustomerRewardUsageService,
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
		const items = await prepareAppointmentItems(
			this.servicesRepository,
			appointmentDate,
			data.items,
		);
		const subtotal = computeSubtotal(items);
		const rewardUsageService =
			this.rewardUsageServiceForTests ?? new CustomerRewardUsageService();
		const previousReward =
			await this.customerRewardsRepository.findUsedDetailByAppointmentId(
				data.id,
			);
		const { rewardItem, discountAmount } =
			await resolveAppointmentCustomerReward({
				customerRewardId: data.customerRewardId,
				customerId: data.customerId,
				appointmentId: data.id,
				subtotal,
				items: items.map((item) => ({
					serviceId: item.serviceId,
					price: item.price,
				})),
				discountAmount: data.discountAmount,
				notes: data.notes,
				customerRewardsRepository: this.customerRewardsRepository,
				rewardUsageService,
			});

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

		await this.connection.transaction(async (trx) => {
			const appointmentsRepository = new PostgresAppointmentsRepository(trx);
			const customerRewardsRepository = new PostgresCustomerRewardsRepository(
				trx,
			);

			await appointmentsRepository.updateWithItems(appointment, items);

			await syncAppointmentCustomerReward({
				appointmentId: data.id,
				previousReward,
				nextReward: rewardItem,
				customerRewardsRepository,
				rewardUsageService,
				now: appointmentDate,
			});
		});
	}
}
