import type { Request, Response } from "express";
import type { CreateCustomerUseCase } from "./CreateCustomerUseCase";

export class CreateCustomerController {
	constructor(private createCustomerUseCase: CreateCustomerUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { name, phone, dateOfBirth, leadSource } = request.body;

			await this.createCustomerUseCase.execute({
				name,
				phone,
				dateOfBirth,
				leadSource,
			});

			return response.status(201).json();
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
