import type { Knex } from "knex";
import { runDailyRoutine } from "@/jobs/dailyRoutine";
import type { IRunDailyRoutineResponseDTO } from "./RunDailyRoutineDTO";

export class RunDailyRoutineUseCase {
	constructor(private connection: Knex) {}

	async execute(): Promise<IRunDailyRoutineResponseDTO> {
		const result = await runDailyRoutine(this.connection);

		return {
			expireCustomerRewards: {
				expiredCount: result.expireCustomerRewards.expiredCount,
				executedAt: result.expireCustomerRewards.executedAt.toISOString(),
			},
			returnReminders: {
				generatedCount: result.returnReminders.generatedCount,
				skippedNoActiveTemplate: result.returnReminders.skippedNoActiveTemplate,
				executedAt: result.returnReminders.executedAt.toISOString(),
			},
			birthdays: {
				generatedCount: result.birthdays.generatedCount,
				grantedCount: result.birthdays.grantedCount,
				skippedNoActiveTemplate: result.birthdays.skippedNoActiveTemplate,
				skippedNoActiveRule: result.birthdays.skippedNoActiveRule,
				executedAt: result.birthdays.executedAt.toISOString(),
			},
		};
	}
}
