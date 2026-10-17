import type { Request, Response } from "express";
import type { UpdateMessageTemplateUseCase } from "./UpdateMessageTemplateUseCase";

export class UpdateMessageTemplateController {
	constructor(
		private updateMessageTemplateUseCase: UpdateMessageTemplateUseCase,
	) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { name, content } = request.body;

			await this.updateMessageTemplateUseCase.execute({
				id: request.params.id as string,
				name,
				content,
			});

			return response.status(200).json();
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
