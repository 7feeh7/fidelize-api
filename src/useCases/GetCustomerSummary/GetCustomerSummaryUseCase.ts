import type { IAppointmentsRepository } from "@/repositories/IAppointmentsRepository";
import type { ICustomerRewardsRepository } from "@/repositories/ICustomerRewardsRepository";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { IReturnRemindersRepository } from "@/repositories/IReturnRemindersRepository";
import { roundMoney } from "@/utils/appointmentCalculations";
import { computeDaysSinceDate } from "@/utils/computeDaysSinceDate";
import { getTodayDateOnly } from "@/utils/getTodayDateOnly";
import { mapCustomerRewardToDTO } from "@/utils/mapCustomerRewardToDTO";
import type { IGetCustomerSummaryResponseDTO } from "./GetCustomerSummaryDTO";

const REWARDS_EXPIRING_SOON_DAYS = 7;

export class GetCustomerSummaryUseCase {
	constructor(
		private customersRepository: ICustomersRepository,
		private appointmentsRepository: IAppointmentsRepository,
		private returnRemindersRepository: IReturnRemindersRepository,
		private customerRewardsRepository: ICustomerRewardsRepository,
	) {}

	async execute(customerId: string): Promise<IGetCustomerSummaryResponseDTO> {
		const normalizedCustomerId = customerId?.trim();

		if (!normalizedCustomerId) {
			throw new Error("Informe o cliente");
		}

		const profile =
			await this.customersRepository.findActiveProfileById(
				normalizedCustomerId,
			);

		if (!profile) {
			throw new Error("Cliente não encontrado");
		}

		const today = getTodayDateOnly();
		const [stats, nextSuggestedReturnDate, expiringSoonRewards] =
			await Promise.all([
				this.appointmentsRepository.getStatsByCustomerId(
					normalizedCustomerId,
				),
				this.returnRemindersRepository.findNextSuggestedReturnDueDate(
					normalizedCustomerId,
					today,
				),
				this.customerRewardsRepository.listAvailableExpiringWithinDays(
					normalizedCustomerId,
					new Date(`${today}T12:00:00.000Z`),
					REWARDS_EXPIRING_SOON_DAYS,
				),
			]);

		const averageTicket =
			stats.totalVisits > 0
				? roundMoney(stats.totalSpent / stats.totalVisits)
				: null;

		const daysSinceLastVisit = stats.lastVisitDate
			? computeDaysSinceDate(today, stats.lastVisitDate)
			: null;

		return {
			id: profile.customer.id as string,
			name: profile.customer.name,
			phone: profile.customer.phone,
			dateOfBirth: profile.customer.dateOfBirth,
			leadSource: profile.customer.leadSource,
			referrerId: profile.referrerId,
			referrerName: profile.referrerName,
			referralsMadeCount: profile.referralsMadeCount,
			indicators: {
				totalVisits: stats.totalVisits,
				totalSpent: roundMoney(stats.totalSpent),
				averageTicket,
				lastVisitDate: stats.lastVisitDate,
				daysSinceLastVisit,
			},
			nextSuggestedReturnDate,
			expiringSoonRewards: expiringSoonRewards.map(mapCustomerRewardToDTO),
		};
	}
}
