import type { Knex } from "knex";
import { expireCustomerRewardsStep } from "./expireCustomerRewardsStep";
import { generateReturnRemindersStep } from "./generateReturnRemindersStep";

export interface DailyRoutineResult {
	expireCustomerRewards: Awaited<ReturnType<typeof expireCustomerRewardsStep>>;
	returnReminders: Awaited<ReturnType<typeof generateReturnRemindersStep>>;
}

export async function runDailyRoutine(
	connection: Knex,
): Promise<DailyRoutineResult> {
	const expireCustomerRewards = await expireCustomerRewardsStep(connection);
	const returnReminders = await generateReturnRemindersStep(connection);

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

	return { expireCustomerRewards, returnReminders };
}
