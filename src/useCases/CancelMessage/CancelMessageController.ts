import type { Request, Response } from "express";
import type { CancelMessageUseCase } from "./CancelMessageUseCase";

export class CancelMessageController {
	constructor(private cancelMessageUseCase: CancelMessageUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { id } = request.params;

			await this.cancelMessageUseCase.execute(id);

			return response.status(204).send();
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
