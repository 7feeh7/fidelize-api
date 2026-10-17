import type { Request, Response } from "express";
import type { UpdateCustomerUseCase } from "./UpdateCustomerUseCase";

export class UpdateCustomerController {
	constructor(private updateCustomerUseCase: UpdateCustomerUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { id } = request.params;
			const { name, phone, dateOfBirth, leadSource, referrerId } =
				request.body;

			if (typeof id !== "string" || !id.trim()) {
				throw new Error("Cliente inválido");
			}

			await this.updateCustomerUseCase.execute({
				id,
				name,
				phone,
				dateOfBirth,
				leadSource,
				referrerId,
			});

			return response.status(204).send();
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
