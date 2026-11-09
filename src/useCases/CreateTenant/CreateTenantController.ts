import type { Request, Response } from "express";
import type { CreateTenantUseCase } from "./CreateTenantUseCase";

export class CreateTenantController {
	constructor(private createTenantUseCase: CreateTenantUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { name, slug } = request.body;

			const result = await this.createTenantUseCase.execute({ name, slug });

			return response.status(201).json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
