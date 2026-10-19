import type { Context } from "aws-lambda";
import serverless from "serverless-http";
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
		await runDailyRoutine(connection);

		return {
			statusCode: 200,
			body: JSON.stringify({ message: "Rotina diária executada com sucesso" }),
		};
	}

	return serverlessHandler(event as Record<string, unknown>, context);
}
