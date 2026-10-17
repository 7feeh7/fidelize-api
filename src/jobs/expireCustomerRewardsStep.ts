import type { Knex } from "knex";
import { PostgresCustomerRewardsRepository } from "@/repositories/implementations/PostgresCustomerRewardsRepository";

export interface ExpireCustomerRewardsStepResult {
	expiredCount: number;
	executedAt: Date;
}

export async function expireCustomerRewardsStep(
	connection: Knex,
	referenceDate = new Date(),
): Promise<ExpireCustomerRewardsStepResult> {
	const repository = new PostgresCustomerRewardsRepository(connection);
	const expiredCount = await repository.expireAvailablePastDue(referenceDate);

	return {
		expiredCount,
		executedAt: referenceDate,
	};
}
