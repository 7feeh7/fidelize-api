import type { Request, Response } from "express";
import type { CreateServiceUseCase } from "./CreateServiceUseCase";

export class CreateServiceController {
	constructor(private createServiceUseCase: CreateServiceUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const {
				name,
				description,
				price,
				durationMinutes,
				suggestedReturnDays,
				active,
			} = request.body;

			await this.createServiceUseCase.execute({
				name,
				description,
				price,
				durationMinutes,
				suggestedReturnDays,
				active,
			});

			return response.status(201).json();
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
