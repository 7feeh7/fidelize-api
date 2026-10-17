import type { Knex } from "knex";
import { expireCustomerRewardsStep } from "./expireCustomerRewardsStep";

export interface DailyRoutineResult {
	expireCustomerRewards: Awaited<ReturnType<typeof expireCustomerRewardsStep>>;
}

export async function runDailyRoutine(
	connection: Knex,
): Promise<DailyRoutineResult> {
	const expireCustomerRewards = await expireCustomerRewardsStep(connection);

	console.info(
		`[daily-routine] Benefícios expirados: ${expireCustomerRewards.expiredCount} (executado em ${expireCustomerRewards.executedAt.toISOString()})`,
	);

	return { expireCustomerRewards };
}
