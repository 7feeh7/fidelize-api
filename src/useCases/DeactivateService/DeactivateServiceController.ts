import type { Request, Response } from "express";
import type { DeactivateServiceUseCase } from "./DeactivateServiceUseCase";

export class DeactivateServiceController {
	constructor(private deactivateServiceUseCase: DeactivateServiceUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { id } = request.params;

			if (typeof id !== "string" || !id.trim()) {
				throw new Error("Serviço inválido");
			}

			await this.deactivateServiceUseCase.execute({ id });

			return response.status(204).send();
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
