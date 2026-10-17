import type { Request, Response } from "express";
import type { SetLoyaltyRuleActiveUseCase } from "./SetLoyaltyRuleActiveUseCase";

export class SetLoyaltyRuleActiveController {
	constructor(
		private setLoyaltyRuleActiveUseCase: SetLoyaltyRuleActiveUseCase,
	) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { id } = request.params;
			const { active } = request.body;

			if (typeof id !== "string" || !id.trim()) {
				throw new Error("Regra de fidelidade inválida");
			}

			await this.setLoyaltyRuleActiveUseCase.execute({ id, active });

			return response.status(204).send();
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
