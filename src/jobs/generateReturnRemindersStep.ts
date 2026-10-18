import type { Knex } from "knex";
import { Message } from "@/entities/Message";
import { PostgresCustomerRewardsRepository } from "@/repositories/implementations/PostgresCustomerRewardsRepository";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import { PostgresMessageTemplatesRepository } from "@/repositories/implementations/PostgresMessageTemplatesRepository";
import { PostgresMessagesRepository } from "@/repositories/implementations/PostgresMessagesRepository";
import { PostgresReturnRemindersRepository } from "@/repositories/implementations/PostgresReturnRemindersRepository";
import { PostgresAppointmentsRepository } from "@/repositories/implementations/PostgresAppointmentsRepository";
import { BuildMessageTemplateVariableValuesService } from "@/services/BuildMessageTemplateVariableValuesService";
import { fillMessageTemplateVariables } from "@/utils/fillMessageTemplateVariables";
import { getTodayDateOnly } from "@/utils/getTodayDateOnly";

export const RETURN_REMINDER_MAX_OVERDUE_DAYS = 30;

export interface GenerateReturnRemindersStepResult {
	generatedCount: number;
	skippedNoActiveTemplate: boolean;
	executedAt: Date;
}

export async function generateReturnRemindersStep(
	connection: Knex,
	referenceDate = new Date(),
): Promise<GenerateReturnRemindersStepResult> {
	const asOfDate = getTodayDateOnly(referenceDate);
	const templatesRepository = new PostgresMessageTemplatesRepository(
		connection,
	);
	const activeTemplate =
		await templatesRepository.findActiveAutomaticByType("RETURN_REMINDER");

	if (!activeTemplate) {
		console.warn(
			"[daily-routine] Lembretes de retorno ignorados: nenhum modelo RETURN_REMINDER ativo",
		);

		return {
			generatedCount: 0,
			skippedNoActiveTemplate: true,
			executedAt: referenceDate,
		};
	}

	const returnRemindersRepository = new PostgresReturnRemindersRepository(
		connection,
	);
	const messagesRepository = new PostgresMessagesRepository(connection);
	const buildVariableValuesService =
		new BuildMessageTemplateVariableValuesService(
			new PostgresCustomersRepository(connection),
			new PostgresAppointmentsRepository(connection),
			new PostgresCustomerRewardsRepository(connection),
		);

	const candidates = await returnRemindersRepository.listEligibleForReminders(
		asOfDate,
		RETURN_REMINDER_MAX_OVERDUE_DAYS,
	);

	let generatedCount = 0;

	for (const candidate of candidates) {
		const { variables, customerRewardId } =
			await buildVariableValuesService.buildForReturnReminder({
				customerId: candidate.customerId,
				customerName: candidate.customerName,
				serviceName: candidate.serviceName,
				appointmentDate: candidate.appointmentDate,
				referenceDate,
			});

		const content = fillMessageTemplateVariables(
			activeTemplate.content,
			variables,
		);

		const message = new Message({
			customerId: candidate.customerId,
			templateId: activeTemplate.id as string,
			appointmentItemId: candidate.appointmentItemId,
			customerRewardId,
			type: "RETURN_REMINDER",
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
		skippedNoActiveTemplate: false,
		executedAt: referenceDate,
	};
}
