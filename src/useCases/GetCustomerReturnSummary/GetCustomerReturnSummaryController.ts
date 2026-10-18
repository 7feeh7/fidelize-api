import type { Request, Response } from "express";
import { readRouteParam } from "@/utils/readRouteParam";
import type { GetCustomerReturnSummaryUseCase } from "./GetCustomerReturnSummaryUseCase";

export class GetCustomerReturnSummaryController {
	constructor(
		private getCustomerReturnSummaryUseCase: GetCustomerReturnSummaryUseCase,
	) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const result = await this.getCustomerReturnSummaryUseCase.execute(
				readRouteParam(request.params.customerId, "customerId"),
			);
			return response.status(200).json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
