import type { Request, Response } from "express";
import type { CreateCustomerMessageUseCase } from "./CreateCustomerMessageUseCase";

export class CreateCustomerMessageController {
	constructor(
		private createCustomerMessageUseCase: CreateCustomerMessageUseCase,
	) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { customerId } = request.params;
			const { templateId, content, scheduledFor } = request.body;

			const result = await this.createCustomerMessageUseCase.execute({
				customerId,
				templateId,
				content,
				scheduledFor,
			});

			return response.status(201).json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
