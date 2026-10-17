import type { Request, Response } from "express";
import type { CancelReferralUseCase } from "./CancelReferralUseCase";

export class CancelReferralController {
	constructor(private cancelReferralUseCase: CancelReferralUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { id } = request.params;

			await this.cancelReferralUseCase.execute({ id: String(id) });

			return response.status(204).send();
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
