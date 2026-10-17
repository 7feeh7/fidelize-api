import type { Request, Response } from "express";
import type { GetMessageTemplateUseCase } from "./GetMessageTemplateUseCase";

export class GetMessageTemplateController {
	constructor(private getMessageTemplateUseCase: GetMessageTemplateUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const result = await this.getMessageTemplateUseCase.execute({
				id: request.params.id as string,
			});

			return response.status(200).json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
