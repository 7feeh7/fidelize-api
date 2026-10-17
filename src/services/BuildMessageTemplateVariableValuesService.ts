import { getBusinessName } from "@/config/businessName";
import type { IAppointmentsRepository } from "@/repositories/IAppointmentsRepository";
import type { ICustomerRewardsRepository } from "@/repositories/ICustomerRewardsRepository";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import { formatLoyaltyRuleRewardSummary } from "@/utils/loyaltyRulePresentation";
import { daysBetweenDateOnly } from "@/utils/dateOnly";
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

export class BuildMessageTemplateVariableValuesService {
	constructor(
		private customersRepository: ICustomersRepository,
		private appointmentsRepository: IAppointmentsRepository,
		private customerRewardsRepository: ICustomerRewardsRepository,
	) {}

	async execute(
		customerId?: string,
		referenceDate = new Date(),
	): Promise<MessageTemplateVariableValues> {
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

				values.dias = String(
					daysBetweenDateOnly(
						detail.appointmentDate.toISOString().slice(0, 10),
						referenceDate.toISOString().slice(0, 10),
					),
				);
			}
		}

		await this.applySoonestAvailableReward(values, customerId);

		return values;
	}

	async buildForReturnReminder(input: {
		customerId: string;
		customerName: string;
		serviceName: string;
		appointmentDate: string;
		referenceDate?: Date;
	}): Promise<{
		variables: MessageTemplateVariableValues;
		customerRewardId: string | null;
	}> {
		const referenceDate = input.referenceDate ?? new Date();
		const referenceDateOnly = referenceDate.toISOString().slice(0, 10);

		const variables: MessageTemplateVariableValues = {
			nome: extractFirstName(input.customerName),
			servico: input.serviceName,
			dias: String(
				daysBetweenDateOnly(input.appointmentDate, referenceDateOnly),
			),
			negocio: getBusinessName(),
		};

		const customerRewardId = await this.applySoonestAvailableReward(
			variables,
			input.customerId,
		);

		return { variables, customerRewardId };
	}

	async buildForBirthday(input: {
		customerId: string;
		customerName: string;
		customerRewardId?: string | null;
		referenceDate?: Date;
	}): Promise<{
		variables: MessageTemplateVariableValues;
		customerRewardId: string | null;
	}> {
		const variables: MessageTemplateVariableValues = {
			nome: extractFirstName(input.customerName),
			negocio: getBusinessName(),
		};

		let customerRewardId = input.customerRewardId ?? null;

		if (customerRewardId) {
			const reward =
				await this.customerRewardsRepository.findDetailById(customerRewardId);

			if (reward) {
				variables.beneficio = formatLoyaltyRuleRewardSummary({
					rewardType: reward.rewardType as LoyaltyRewardType,
					rewardValue: reward.rewardValue,
					freeServiceName: reward.freeServiceName,
				});

				if (reward.reward.expiresAt) {
					variables.validade = formatDayMonth(reward.reward.expiresAt);
				}
			}
		} else {
			customerRewardId = await this.applySoonestAvailableReward(
				variables,
				input.customerId,
			);
		}

		return { variables, customerRewardId };
	}

	private async applySoonestAvailableReward(
		values: MessageTemplateVariableValues,
		customerId: string,
	): Promise<string | null> {
		const reward =
			await this.customerRewardsRepository.findSoonestExpiringAvailable(
				customerId,
			);

		if (!reward) {
			return null;
		}

		values.beneficio = formatLoyaltyRuleRewardSummary({
			rewardType: reward.rewardType as LoyaltyRewardType,
			rewardValue: reward.rewardValue,
			freeServiceName: reward.freeServiceName,
		});

		if (reward.reward.expiresAt) {
			values.validade = formatDayMonth(reward.reward.expiresAt);
		}

		return reward.reward.id as string;
	}
}
