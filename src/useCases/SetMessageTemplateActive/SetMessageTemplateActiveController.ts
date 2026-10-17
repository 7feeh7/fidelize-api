import type { Request, Response } from "express";
import type { SetMessageTemplateActiveUseCase } from "./SetMessageTemplateActiveUseCase";

export class SetMessageTemplateActiveController {
	constructor(
		private setMessageTemplateActiveUseCase: SetMessageTemplateActiveUseCase,
	) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { active } = request.body;

			await this.setMessageTemplateActiveUseCase.execute({
				id: request.params.id as string,
				active,
			});

			return response.status(200).json();
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
