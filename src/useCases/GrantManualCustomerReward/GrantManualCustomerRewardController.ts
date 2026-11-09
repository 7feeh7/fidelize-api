import type { Request, Response } from "express";
import { readRouteParam } from "@/utils/readRouteParam";
import type { GrantManualCustomerRewardUseCase } from "./GrantManualCustomerRewardUseCase";

export class GrantManualCustomerRewardController {
	constructor(
		private grantManualCustomerRewardUseCase: GrantManualCustomerRewardUseCase,
	) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const { loyaltyRuleId } = request.body;

			const result = await this.grantManualCustomerRewardUseCase.execute(
				request.auth.tenantId,
				{
					customerId: readRouteParam(request.params.customerId, "customerId"),
					loyaltyRuleId,
				},
			);

			return response.status(201).json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
