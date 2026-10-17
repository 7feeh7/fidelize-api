import { getBusinessName } from "@/config/businessName";
import type { IAppointmentsRepository } from "@/repositories/IAppointmentsRepository";
import type { ICustomerRewardsRepository } from "@/repositories/ICustomerRewardsRepository";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import { formatLoyaltyRuleRewardSummary } from "@/utils/loyaltyRulePresentation";
import {
	extractFirstName,
	type MessageTemplateVariableValues,
} from "@/utils/fillMessageTemplateVariables";
import type { LoyaltyRewardType } from "@/entities/LoyaltyRule";

export const SAMPLE_MESSAGE_TEMPLATE_VARIABLES: MessageTemplateVariableValues =
	{
		nome: "Maria",
		servico: "hidratação",
		dias: "30",
		beneficio: "hidratação grátis",
		validade: "31/12",
		negocio: getBusinessName(),
	};

function formatDayMonth(date: Date): string {
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0");
	return `${day}/${month}`;
}

function daysSince(date: Date, reference = new Date()): number {
	const start = new Date(date);
	start.setHours(0, 0, 0, 0);
	const end = new Date(reference);
	end.setHours(0, 0, 0, 0);
	return Math.floor((end.getTime() - start.getTime()) / 86_400_000);
}

export class BuildMessageTemplateVariableValuesService {
	constructor(
		private customersRepository: ICustomersRepository,
		private appointmentsRepository: IAppointmentsRepository,
		private customerRewardsRepository: ICustomerRewardsRepository,
	) {}

	async execute(customerId?: string): Promise<MessageTemplateVariableValues> {
		if (!customerId) {
			return { ...SAMPLE_MESSAGE_TEMPLATE_VARIABLES };
		}

		const customer = await this.customersRepository.findActiveById(customerId);

		if (!customer) {
			throw new Error("Cliente não encontrado");
		}

		const values: MessageTemplateVariableValues = {
			nome: extractFirstName(customer.name),
			negocio: getBusinessName(),
		};

		const appointments = await this.appointmentsRepository.list({
			page: 1,
			perPage: 1,
			customerId,
		});

		const latestAppointmentId = appointments.items[0]?.id;
		if (latestAppointmentId) {
			const detail =
				await this.appointmentsRepository.findDetailById(latestAppointmentId);

			if (detail) {
				const primaryItem = detail.items[0];
				if (primaryItem) {
					values.servico = primaryItem.serviceName;
				}

				values.dias = String(daysSince(detail.appointmentDate));
			}
		}

		const rewards = await this.customerRewardsRepository.listByCustomerId(
			customerId,
			"AVAILABLE",
		);
		const reward = rewards[0];

		if (reward) {
			values.beneficio = formatLoyaltyRuleRewardSummary({
				rewardType: reward.rewardType as LoyaltyRewardType,
				rewardValue: reward.rewardValue,
				freeServiceName: reward.freeServiceName,
			});

			if (reward.reward.expiresAt) {
				values.validade = formatDayMonth(reward.reward.expiresAt);
			}
		}

		return values;
	}
}
