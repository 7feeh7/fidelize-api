import type { Knex } from "knex";
import { CustomerReward } from "@/entities/CustomerReward";
import { Message } from "@/entities/Message";
import { PostgresBirthdaysRepository } from "@/repositories/implementations/PostgresBirthdaysRepository";
import { PostgresCustomerRewardsRepository } from "@/repositories/implementations/PostgresCustomerRewardsRepository";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import { PostgresLoyaltyRulesRepository } from "@/repositories/implementations/PostgresLoyaltyRulesRepository";
import { PostgresMessageTemplatesRepository } from "@/repositories/implementations/PostgresMessageTemplatesRepository";
import { PostgresMessagesRepository } from "@/repositories/implementations/PostgresMessagesRepository";
import { PostgresAppointmentsRepository } from "@/repositories/implementations/PostgresAppointmentsRepository";
import { BuildMessageTemplateVariableValuesService } from "@/services/BuildMessageTemplateVariableValuesService";
import {
	getCalendarYearFromDateOnly,
	getEndOfMonthExpiresAt,
} from "@/utils/birthday";
import { fillMessageTemplateVariables } from "@/utils/fillMessageTemplateVariables";
import { getTodayDateOnly } from "@/utils/getTodayDateOnly";

export interface GenerateBirthdaysStepResult {
	generatedCount: number;
	grantedCount: number;
	skippedNoActiveTemplate: boolean;
	skippedNoActiveRule: boolean;
	executedAt: Date;
}

export async function generateBirthdaysStep(
	connection: Knex,
	referenceDate = new Date(),
): Promise<GenerateBirthdaysStepResult> {
	const asOfDate = getTodayDateOnly(referenceDate);
	const calendarYear = getCalendarYearFromDateOnly(asOfDate);

	const templatesRepository = new PostgresMessageTemplatesRepository(connection);
	const loyaltyRulesRepository = new PostgresLoyaltyRulesRepository(connection);
	const activeTemplate =
		await templatesRepository.findActiveAutomaticByType("BIRTHDAY");
	const birthdayRules =
		await loyaltyRulesRepository.listActiveByTriggerType("BIRTHDAY");

	const skippedNoActiveTemplate = !activeTemplate;
	const skippedNoActiveRule = birthdayRules.length === 0;

	if (skippedNoActiveTemplate) {
		console.warn(
			"[daily-routine] Aniversários: nenhum modelo BIRTHDAY ativo — mensagens não serão geradas",
		);
	}

	if (skippedNoActiveRule) {
		console.warn(
			"[daily-routine] Aniversários: nenhuma regra BIRTHDAY ativa — benefícios não serão concedidos",
		);
	}

	if (skippedNoActiveTemplate && skippedNoActiveRule) {
		return {
			generatedCount: 0,
			grantedCount: 0,
			skippedNoActiveTemplate: true,
			skippedNoActiveRule: true,
			executedAt: referenceDate,
		};
	}

	const birthdaysRepository = new PostgresBirthdaysRepository(connection);
	const customerRewardsRepository = new PostgresCustomerRewardsRepository(
		connection,
	);
	const messagesRepository = new PostgresMessagesRepository(connection);
	const buildVariableValuesService = new BuildMessageTemplateVariableValuesService(
		new PostgresCustomersRepository(connection),
		new PostgresAppointmentsRepository(connection),
		customerRewardsRepository,
	);

	const candidates = await birthdaysRepository.listCandidatesForDate(asOfDate);
	const expiresAt = getEndOfMonthExpiresAt(asOfDate);
	const grantedAt = referenceDate;

	let generatedCount = 0;
	let grantedCount = 0;

	for (const candidate of candidates) {
		let linkedRewardId: string | null = null;

		if (!skippedNoActiveRule) {
			for (const ruleRecord of birthdayRules) {
				const loyaltyRuleId = ruleRecord.rule.id as string;
				const alreadyGranted =
					await customerRewardsRepository.existsBirthdayGrantForYear(
						candidate.customerId,
						loyaltyRuleId,
						calendarYear,
					);

				if (alreadyGranted) {
					continue;
				}

				const reward = new CustomerReward({
					customerId: candidate.customerId,
					loyaltyRuleId,
					referralId: null,
					appointmentId: null,
					grantYear: calendarYear,
					status: "AVAILABLE",
					grantedAt,
					expiresAt,
					usedAt: null,
				});

				await customerRewardsRepository.save(reward);
				linkedRewardId = reward.id as string;
				grantedCount += 1;
			}
		}

		if (skippedNoActiveTemplate) {
			continue;
		}

		const alreadyMessaged = await messagesRepository.existsBirthdayMessageForYear(
			candidate.customerId,
			calendarYear,
		);

		if (alreadyMessaged) {
			continue;
		}

		const { variables, customerRewardId } =
			await buildVariableValuesService.buildForBirthday({
				customerId: candidate.customerId,
				customerName: candidate.customerName,
				customerRewardId: linkedRewardId,
				referenceDate,
			});

		const content = fillMessageTemplateVariables(
			activeTemplate.content,
			variables,
		);

		const message = new Message({
			customerId: candidate.customerId,
			templateId: activeTemplate.id as string,
			appointmentItemId: null,
			customerRewardId,
			type: "BIRTHDAY",
			content,
			status: "PENDING",
			scheduledFor: asOfDate,
			sentAt: null,
			sentBy: null,
			createdAt: new Date(),
		});

		await messagesRepository.save(message);
		generatedCount += 1;
	}

	return {
		generatedCount,
		grantedCount,
		skippedNoActiveTemplate,
		skippedNoActiveRule,
		executedAt: referenceDate,
	};
}
