import type { Request, Response } from "express";
import type { UpdateLoyaltyRuleUseCase } from "./UpdateLoyaltyRuleUseCase";

export class UpdateLoyaltyRuleController {
	constructor(private updateLoyaltyRuleUseCase: UpdateLoyaltyRuleUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { id } = request.params;
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

			if (typeof id !== "string" || !id.trim()) {
				throw new Error("Regra de fidelidade inválida");
			}

			await this.updateLoyaltyRuleUseCase.execute({
				id,
				name,
				description,
				triggerType,
				visitCount,
				rewardType,
				rewardValue,
				freeServiceId,
				validDays,
			});

			return response.status(204).send();
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
