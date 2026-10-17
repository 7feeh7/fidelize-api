import type { Request, Response } from "express";
import type { RunDailyRoutineUseCase } from "./RunDailyRoutineUseCase";

export class RunDailyRoutineController {
	constructor(private runDailyRoutineUseCase: RunDailyRoutineUseCase) {}

	async handle(_request: Request, response: Response): Promise<Response> {
		try {
			const result = await this.runDailyRoutineUseCase.execute();
			return response.status(200).json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
