import type { Knex } from "knex";
import type { Tenant } from "@/entities/Tenant";
import { PostgresCustomerRewardsRepository } from "@/repositories/implementations/PostgresCustomerRewardsRepository";

export interface ExpireCustomerRewardsStepResult {
	expiredCount: number;
	executedAt: Date;
}

export async function expireCustomerRewardsStep(
	connection: Knex,
	tenant: Tenant,
	referenceDate = new Date(),
): Promise<ExpireCustomerRewardsStepResult> {
	const repository = new PostgresCustomerRewardsRepository(connection);
	const expiredCount = await repository.expireAvailablePastDue(
		tenant.id as string,
		referenceDate,
	);

	return {
		expiredCount,
		executedAt: referenceDate,
	};
}
