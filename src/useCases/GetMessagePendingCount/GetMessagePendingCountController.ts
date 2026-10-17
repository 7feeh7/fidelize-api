import type { Request, Response } from "express";
import type { GetMessagePendingCountUseCase } from "./GetMessagePendingCountUseCase";

export class GetMessagePendingCountController {
	constructor(
		private getMessagePendingCountUseCase: GetMessagePendingCountUseCase,
	) {}

	async handle(_request: Request, response: Response): Promise<Response> {
		try {
			const result = await this.getMessagePendingCountUseCase.execute();
			return response.status(200).json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
