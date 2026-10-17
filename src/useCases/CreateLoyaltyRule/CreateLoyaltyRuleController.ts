import type { Request, Response } from "express";
import type { CreateLoyaltyRuleUseCase } from "./CreateLoyaltyRuleUseCase";

export class CreateLoyaltyRuleController {
	constructor(private createLoyaltyRuleUseCase: CreateLoyaltyRuleUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const {
				name,
				description,
				triggerType,
				visitCount,
				rewardType,
				rewardValue,
				freeServiceId,
				validDays,
			} = request.body;

			await this.createLoyaltyRuleUseCase.execute({
				name,
				description,
				triggerType,
				visitCount,
				rewardType,
				rewardValue,
				freeServiceId,
				validDays,
			});

			return response.status(201).json();
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
