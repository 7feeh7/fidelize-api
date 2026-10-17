import type { Request, Response } from "express";
import type { GrantManualCustomerRewardUseCase } from "./GrantManualCustomerRewardUseCase";

export class GrantManualCustomerRewardController {
	constructor(
		private grantManualCustomerRewardUseCase: GrantManualCustomerRewardUseCase,
	) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { customerId } = request.params;
			const { loyaltyRuleId } = request.body;

			const result = await this.grantManualCustomerRewardUseCase.execute({
				customerId,
				loyaltyRuleId,
			});

			return response.status(201).json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
