import type { Request, Response } from "express";
import type { UpdateServiceUseCase } from "./UpdateServiceUseCase";

export class UpdateServiceController {
	constructor(private updateServiceUseCase: UpdateServiceUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { id } = request.params;
			const {
				name,
				description,
				price,
				durationMinutes,
				suggestedReturnDays,
			} = request.body;

			if (typeof id !== "string" || !id.trim()) {
				throw new Error("Serviço inválido");
			}

			await this.updateServiceUseCase.execute({
				id,
				name,
				description,
				price,
				durationMinutes,
				suggestedReturnDays,
			});

			return response.status(204).send();
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
