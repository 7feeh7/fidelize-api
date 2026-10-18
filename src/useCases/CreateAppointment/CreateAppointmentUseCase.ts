import type { Knex } from "knex";
import { Appointment } from "@/entities/Appointment";
import type { IAppointmentsRepository } from "@/repositories/IAppointmentsRepository";
import type { ICustomerRewardsRepository } from "@/repositories/ICustomerRewardsRepository";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { IReferralsRepository } from "@/repositories/IReferralsRepository";
import type { IServicesRepository } from "@/repositories/IServicesRepository";
import type { IUsersRepository } from "@/repositories/IUsersRepository";
import { PostgresAppointmentsRepository } from "@/repositories/implementations/PostgresAppointmentsRepository";
import { PostgresCustomerRewardsRepository } from "@/repositories/implementations/PostgresCustomerRewardsRepository";
import { PostgresReferralsRepository } from "@/repositories/implementations/PostgresReferralsRepository";
import { CustomerRewardUsageService } from "@/services/CustomerRewardUsageService";
import { createGrantCustomerRewardsService } from "@/services/createGrantCustomerRewardsService";
import type {
	GrantCustomerRewardsService,
	GrantedRewardDTO,
} from "@/services/GrantCustomerRewardsService";
import { computeSubtotal, computeTotal } from "@/utils/appointmentCalculations";
import {
	parseAppointmentDate,
	prepareAppointmentItems,
} from "@/utils/prepareAppointmentItems";
import { resolveAppointmentCustomerReward } from "@/utils/resolveAppointmentCustomerReward";
import { syncAppointmentCustomerReward } from "@/utils/syncAppointmentCustomerReward";
import type { ICreateAppointmentRequestDTO } from "./CreateAppointmentDTO";

export interface ICreateAppointmentResponseDTO {
	grantedRewards: GrantedRewardDTO[];
}

export class CreateAppointmentUseCase {
	constructor(
		_appointmentsRepository: IAppointmentsRepository,
		private customersRepository: ICustomersRepository,
		private servicesRepository: IServicesRepository,
		private usersRepository: IUsersRepository,
		_referralsRepository: IReferralsRepository,
		private customerRewardsRepository: ICustomerRewardsRepository,
		private connection: Knex,
		private grantCustomerRewardsServiceForTests?: GrantCustomerRewardsService,
		private rewardUsageServiceForTests?: CustomerRewardUsageService,
	) {}

	async execute(
		data: ICreateAppointmentRequestDTO,
	): Promise<ICreateAppointmentResponseDTO> {
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
		const items = await prepareAppointmentItems(
			this.servicesRepository,
			appointmentDate,
			data.items,
		);
		const subtotal = computeSubtotal(items);
		const rewardUsageService =
			this.rewardUsageServiceForTests ?? new CustomerRewardUsageService();
		const { rewardItem, discountAmount } =
			await resolveAppointmentCustomerReward({
				customerRewardId: data.customerRewardId,
				customerId: data.customerId,
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

		const appointment = new Appointment({
			customerId: data.customerId,
			userId: resolvedUserId,
			appointmentDate,
			subtotal,
			discountAmount,
			total,
			notes: data.notes?.trim() ? data.notes.trim() : null,
		});

		const grantedRewards: GrantedRewardDTO[] = [];

		await this.connection.transaction(async (trx) => {
			const appointmentsRepository = new PostgresAppointmentsRepository(trx);
			const referralsRepository = new PostgresReferralsRepository(trx);
			const customerRewardsRepository = new PostgresCustomerRewardsRepository(
				trx,
			);
			const grantService =
				this.grantCustomerRewardsServiceForTests ??
				createGrantCustomerRewardsService(trx);

			await appointmentsRepository.saveWithItems(appointment, items, trx);

			await syncAppointmentCustomerReward({
				appointmentId: appointment.id as string,
				previousReward: null,
				nextReward: rewardItem,
				customerRewardsRepository,
				rewardUsageService,
				now: appointmentDate,
			});

			const appointmentCount = await appointmentsRepository.countByCustomerId(
				data.customerId,
				trx,
			);

			grantedRewards.push(
				...(await grantService.grantVisitCount(
					data.customerId,
					appointmentCount,
				)),
			);

			if (appointmentCount === 1) {
				const convertedReferrals =
					await referralsRepository.convertPendingByReferredId(
						data.customerId,
						appointmentDate,
						trx,
					);

				grantedRewards.push(
					...(await grantService.grantForConvertedReferrals(
						convertedReferrals,
					)),
				);
			}
		});

		return { grantedRewards };
	}
}
