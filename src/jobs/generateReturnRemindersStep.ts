import type { Knex } from "knex";
import { Message } from "@/entities/Message";
import type { Tenant } from "@/entities/Tenant";
import { logger } from "@/providers/implementations/PinoLogger";
import { PostgresAppointmentsRepository } from "@/repositories/implementations/PostgresAppointmentsRepository";
import { PostgresCustomerRewardsRepository } from "@/repositories/implementations/PostgresCustomerRewardsRepository";
import { PostgresCustomersRepository } from "@/repositories/implementations/PostgresCustomersRepository";
import { PostgresMessagesRepository } from "@/repositories/implementations/PostgresMessagesRepository";
import { PostgresMessageTemplatesRepository } from "@/repositories/implementations/PostgresMessageTemplatesRepository";
import { PostgresReturnRemindersRepository } from "@/repositories/implementations/PostgresReturnRemindersRepository";
import { PostgresTenantsRepository } from "@/repositories/implementations/PostgresTenantsRepository";
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
	tenant: Tenant,
	referenceDate = new Date(),
): Promise<GenerateReturnRemindersStepResult> {
	const tenantId = tenant.id as string;
	const asOfDate = getTodayDateOnly(referenceDate);
	const templatesRepository = new PostgresMessageTemplatesRepository(
		connection,
	);
	const activeTemplate = await templatesRepository.findActiveAutomaticByType(
		tenantId,
		"RETURN_REMINDER",
	);

	if (!activeTemplate) {
		logger.warn(
			{ tenantId, step: "return-reminders", reason: "no-active-template" },
			"Lembretes de retorno ignorados: nenhum modelo RETURN_REMINDER ativo",
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
			new PostgresTenantsRepository(connection),
		);

	const candidates = await returnRemindersRepository.listEligibleForReminders(
		tenantId,
		asOfDate,
		RETURN_REMINDER_MAX_OVERDUE_DAYS,
	);

	let generatedCount = 0;

	for (const candidate of candidates) {
		const { variables, customerRewardId } =
			await buildVariableValuesService.buildForReturnReminder(tenant, {
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

		const inserted =
			await messagesRepository.saveIgnoringAppointmentItemConflict(
				tenantId,
				message,
			);

		if (inserted) {
			generatedCount += 1;
		}
	}

	return {
		generatedCount,
		skippedNoActiveTemplate: false,
		executedAt: referenceDate,
	};
}
