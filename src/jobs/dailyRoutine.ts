import type { Knex } from "knex";
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

	console.info(
		`[daily-routine] Benefícios expirados: ${expireCustomerRewards.expiredCount} (executado em ${expireCustomerRewards.executedAt.toISOString()})`,
	);
	console.info(
		`[daily-routine] Lembretes de retorno gerados: ${returnReminders.generatedCount} (executado em ${returnReminders.executedAt.toISOString()})`,
	);

	if (returnReminders.skippedNoActiveTemplate) {
		console.warn(
			"[daily-routine] Etapa de lembretes de retorno concluída sem modelo ativo",
		);
	}

	console.info(
		`[daily-routine] Aniversários: ${birthdays.generatedCount} mensagem(ns), ${birthdays.grantedCount} benefício(s) (executado em ${birthdays.executedAt.toISOString()})`,
	);

	if (birthdays.skippedNoActiveTemplate) {
		console.warn(
			"[daily-routine] Etapa de aniversários concluída sem modelo BIRTHDAY ativo",
		);
	}

	if (birthdays.skippedNoActiveRule) {
		console.warn(
			"[daily-routine] Etapa de aniversários concluída sem regra BIRTHDAY ativa",
		);
	}

	return { expireCustomerRewards, returnReminders, birthdays };
}
