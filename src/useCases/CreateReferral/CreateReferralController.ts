import type { Request, Response } from "express";
import type { CreateReferralUseCase } from "./CreateReferralUseCase";

export class CreateReferralController {
	constructor(private createReferralUseCase: CreateReferralUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { referrerId, referredId } = request.body;

			await this.createReferralUseCase.execute({
				referrerId,
				referredId,
			});

			return response.status(201).json();
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
