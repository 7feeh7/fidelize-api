import type { Request, Response } from "express";
import type { MessageTemplateType } from "@/entities/MessageTemplate";
import type { CreateMessageTemplateUseCase } from "./CreateMessageTemplateUseCase";

export class CreateMessageTemplateController {
	constructor(
		private createMessageTemplateUseCase: CreateMessageTemplateUseCase,
	) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { name, type, content } = request.body;

			await this.createMessageTemplateUseCase.execute({
				name,
				type: type as MessageTemplateType,
				content,
			});

			return response.status(201).json();
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
