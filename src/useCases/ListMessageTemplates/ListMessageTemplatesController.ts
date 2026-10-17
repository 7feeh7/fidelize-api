import type { Request, Response } from "express";
import type { ListMessageTemplatesUseCase } from "./ListMessageTemplatesUseCase";

export class ListMessageTemplatesController {
	constructor(
		private listMessageTemplatesUseCase: ListMessageTemplatesUseCase,
	) {}

	async handle(_request: Request, response: Response): Promise<Response> {
		try {
			const result = await this.listMessageTemplatesUseCase.execute();
			return response.status(200).json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
