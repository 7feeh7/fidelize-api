import type { Knex } from "knex";
import { runDailyRoutine } from "./dailyRoutine";

function parseRoutineHour(): number {
	const parsed = Number(process.env.DAILY_ROUTINE_HOUR ?? "3");

	if (!Number.isInteger(parsed) || parsed < 0 || parsed > 23) {
		return 3;
	}

	return parsed;
}

function parseRoutineMinute(): number {
	const parsed = Number(process.env.DAILY_ROUTINE_MINUTE ?? "0");

	if (!Number.isInteger(parsed) || parsed < 0 || parsed > 59) {
		return 0;
	}

	return parsed;
}

function millisecondsUntilNextRun(hour: number, minute: number): number {
	const now = new Date();
	const nextRun = new Date(now);
	nextRun.setHours(hour, minute, 0, 0);

	if (nextRun.getTime() <= now.getTime()) {
		nextRun.setDate(nextRun.getDate() + 1);
	}

	return nextRun.getTime() - now.getTime();
}

export function startDailyRoutine(connection: Knex): void {
	const hour = parseRoutineHour();
	const minute = parseRoutineMinute();

	const scheduleNext = () => {
		const delayMs = millisecondsUntilNextRun(hour, minute);

		setTimeout(async () => {
			try {
				await runDailyRoutine(connection);
			} catch (error) {
				console.error("[daily-routine] Falha na execução", error);
			} finally {
				scheduleNext();
			}
		}, delayMs);
	};

	scheduleNext();
}
