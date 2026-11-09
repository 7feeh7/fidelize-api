import type { LoyaltyRewardType } from "@/entities/LoyaltyRule";
import type { IAppointmentsRepository } from "@/repositories/IAppointmentsRepository";
import type { ICustomerRewardsRepository } from "@/repositories/ICustomerRewardsRepository";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { ITenantsRepository } from "@/repositories/ITenantsRepository";
import { daysBetweenDateOnly } from "@/utils/dateOnly";
import {
	extractFirstName,
	type MessageTemplateVariableValues,
} from "@/utils/fillMessageTemplateVariables";
import { formatLoyaltyRuleRewardSummary } from "@/utils/loyaltyRulePresentation";

export interface MessageTemplateTenant {
	id?: string;
	name: string;
}

function buildSampleVariables(
	businessName: string,
): MessageTemplateVariableValues {
	return {
		nome: "Maria",
		servico: "hidratação",
		dias: "30",
		beneficio: "hidratação grátis",
		validade: "31/12",
		negocio: businessName,
	};
}

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
		private tenantsRepository: ITenantsRepository,
	) {}

	async execute(
		tenantId: string,
		customerId?: string,
		referenceDate = new Date(),
	): Promise<MessageTemplateVariableValues> {
		const tenant = await this.tenantsRepository.findById(tenantId);

		if (!tenant) {
			throw new Error("Negócio não encontrado");
		}

		if (!customerId) {
			return buildSampleVariables(tenant.name);
		}

		const customer = await this.customersRepository.findActiveById(
			tenantId,
			customerId,
		);

		if (!customer) {
			throw new Error("Cliente não encontrado");
		}

		const values: MessageTemplateVariableValues = {
			nome: extractFirstName(customer.name),
			negocio: tenant.name,
		};

		const appointments = await this.appointmentsRepository.list(tenantId, {
			page: 1,
			perPage: 1,
			customerId,
		});

		const latestAppointmentId = appointments.items[0]?.id;
		if (latestAppointmentId) {
			const detail = await this.appointmentsRepository.findDetailById(
				tenantId,
				latestAppointmentId,
			);

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

		await this.applySoonestAvailableReward(tenantId, values, customerId);

		return values;
	}

	async buildForReturnReminder(
		tenant: MessageTemplateTenant,
		input: {
			customerId: string;
			customerName: string;
			serviceName: string;
			appointmentDate: string;
			referenceDate?: Date;
		},
	): Promise<{
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
			negocio: tenant.name,
		};

		const customerRewardId = await this.applySoonestAvailableReward(
			tenant.id as string,
			variables,
			input.customerId,
		);

		return { variables, customerRewardId };
	}

	async buildForBirthday(
		tenant: MessageTemplateTenant,
		input: {
			customerId: string;
			customerName: string;
			customerRewardId?: string | null;
			referenceDate?: Date;
		},
	): Promise<{
		variables: MessageTemplateVariableValues;
		customerRewardId: string | null;
	}> {
		const variables: MessageTemplateVariableValues = {
			nome: extractFirstName(input.customerName),
			negocio: tenant.name,
		};

		let customerRewardId = input.customerRewardId ?? null;

		if (customerRewardId) {
			const reward = await this.customerRewardsRepository.findDetailById(
				tenant.id as string,
				customerRewardId,
			);

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
				tenant.id as string,
				variables,
				input.customerId,
			);
		}

		return { variables, customerRewardId };
	}

	private async applySoonestAvailableReward(
		tenantId: string,
		values: MessageTemplateVariableValues,
		customerId: string,
	): Promise<string | null> {
		const reward =
			await this.customerRewardsRepository.findSoonestExpiringAvailable(
				tenantId,
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
