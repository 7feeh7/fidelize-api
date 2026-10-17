import type { Request, Response } from "express";
import type { MarkMessageSentUseCase } from "./MarkMessageSentUseCase";

export class MarkMessageSentController {
	constructor(private markMessageSentUseCase: MarkMessageSentUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { id } = request.params;
			const { loggedUserId } = request.body;

			const result = await this.markMessageSentUseCase.execute({
				id,
				loggedUserId,
			});

			return response.status(200).json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
