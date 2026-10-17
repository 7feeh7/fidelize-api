import type { Request, Response } from "express";
import type { PreviewMessageTemplateUseCase } from "./PreviewMessageTemplateUseCase";

export class PreviewMessageTemplateController {
	constructor(
		private previewMessageTemplateUseCase: PreviewMessageTemplateUseCase,
	) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { content, templateId, customerId } = request.body;

			const result = await this.previewMessageTemplateUseCase.execute({
				content,
				templateId,
				customerId,
			});

			return response.status(200).json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
