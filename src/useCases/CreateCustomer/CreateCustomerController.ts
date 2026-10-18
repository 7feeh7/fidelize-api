import type { Request, Response } from "express";
import type { CreateCustomerUseCase } from "./CreateCustomerUseCase";

export class CreateCustomerController {
	constructor(private createCustomerUseCase: CreateCustomerUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { name, phone, dateOfBirth, leadSource, referrerId } = request.body;

			const { grantedRewards } = await this.createCustomerUseCase.execute({
				name,
				phone,
				dateOfBirth,
				leadSource,
				referrerId,
				isExistingCustomer: Boolean(request.body.isExistingCustomer),
			});

			return response.status(201).json({ grantedRewards });
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
