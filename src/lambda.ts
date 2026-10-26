import type { Context } from "aws-lambda";
import serverless from "serverless-http";
import { logger } from "@/providers/implementations/PinoLogger";
import { app } from "./app";
import { connection } from "./database/connection";
import { runDailyRoutine } from "./jobs/dailyRoutine";
import { isDailyRoutineEvent } from "./lambda/isDailyRoutineEvent";

const serverlessHandler = serverless(app);

export async function handler(
	event: unknown,
	context: Context,
): Promise<unknown> {
	// Knex keeps the pool open; without this the invocation waits until Lambda times out.
	context.callbackWaitsForEmptyEventLoop = false;

	if (isDailyRoutineEvent(event)) {
		try {
			await runDailyRoutine(connection);

			logger.info(
				{ event: "daily-routine" },
				"Rotina diaria executada com sucesso",
			);

			return {
				statusCode: 200,
				body: JSON.stringify({
					message: "Rotina diária executada com sucesso",
				}),
			};
		} catch (error) {
			logger.error(
				{ err: error, event: "daily-routine" },
				"Falha na rotina diaria",
			);

			throw error;
		}
	}

	return serverlessHandler(event as Record<string, unknown>, context);
}
