import type { Request, Response } from "express";
import type { GetLoyaltyRuleUseCase } from "./GetLoyaltyRuleUseCase";

export class GetLoyaltyRuleController {
	constructor(private getLoyaltyRuleUseCase: GetLoyaltyRuleUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { id } = request.params;

			if (typeof id !== "string" || !id.trim()) {
				throw new Error("Regra de fidelidade inválida");
			}

			const data = await this.getLoyaltyRuleUseCase.execute({ id });

			return response.status(200).json(data);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
