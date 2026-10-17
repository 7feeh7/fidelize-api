import type { Request, Response } from "express";
import type { GetMessageWhatsAppLinkUseCase } from "./GetMessageWhatsAppLinkUseCase";

export class GetMessageWhatsAppLinkController {
	constructor(
		private getMessageWhatsAppLinkUseCase: GetMessageWhatsAppLinkUseCase,
	) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { id } = request.params;

			const result = await this.getMessageWhatsAppLinkUseCase.execute(id);

			return response.status(200).json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
