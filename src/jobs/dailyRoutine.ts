import type { Knex } from "knex";
import { logger } from "@/providers/implementations/PinoLogger";
import { expireCustomerRewardsStep } from "./expireCustomerRewardsStep";
import { generateBirthdaysStep } from "./generateBirthdaysStep";
import { generateReturnRemindersStep } from "./generateReturnRemindersStep";

export interface DailyRoutineResult {
	expireCustomerRewards: Awaited<ReturnType<typeof expireCustomerRewardsStep>>;
	returnReminders: Awaited<ReturnType<typeof generateReturnRemindersStep>>;
	birthdays: Awaited<ReturnType<typeof generateBirthdaysStep>>;
}

export async function runDailyRoutine(
	connection: Knex,
): Promise<DailyRoutineResult> {
	const expireCustomerRewards = await expireCustomerRewardsStep(connection);
	const returnReminders = await generateReturnRemindersStep(connection);
	const birthdays = await generateBirthdaysStep(connection);

	logger.info(
		{
			step: "expire-customer-rewards",
			expiredCount: expireCustomerRewards.expiredCount,
			executedAt: expireCustomerRewards.executedAt.toISOString(),
		},
		"Beneficios expirados na rotina diaria",
	);

	logger.info(
		{
			step: "return-reminders",
			generatedCount: returnReminders.generatedCount,
			executedAt: returnReminders.executedAt.toISOString(),
		},
		"Lembretes de retorno gerados na rotina diaria",
	);

	if (returnReminders.skippedNoActiveTemplate) {
		logger.warn(
			{ step: "return-reminders", reason: "no-active-template" },
			"Etapa de lembretes de retorno concluida sem modelo ativo",
		);
	}

	logger.info(
		{
			step: "birthdays",
			generatedCount: birthdays.generatedCount,
			grantedCount: birthdays.grantedCount,
			executedAt: birthdays.executedAt.toISOString(),
		},
		"Aniversarios processados na rotina diaria",
	);

	if (birthdays.skippedNoActiveTemplate) {
		logger.warn(
			{ step: "birthdays", reason: "no-active-birthday-template" },
			"Etapa de aniversarios concluida sem modelo BIRTHDAY ativo",
		);
	}

	if (birthdays.skippedNoActiveRule) {
		logger.warn(
			{ step: "birthdays", reason: "no-active-birthday-rule" },
			"Etapa de aniversarios concluida sem regra BIRTHDAY ativa",
		);
	}

	return { expireCustomerRewards, returnReminders, birthdays };
}
