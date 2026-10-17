import type { Request, Response } from "express";
import type { DeactivateCustomerUseCase } from "./DeactivateCustomerUseCase";

export class DeactivateCustomerController {
	constructor(private deactivateCustomerUseCase: DeactivateCustomerUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { id } = request.params;

			if (typeof id !== "string" || !id.trim()) {
				throw new Error("Cliente inválido");
			}

			await this.deactivateCustomerUseCase.execute({ id });

			return response.status(204).send();
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
