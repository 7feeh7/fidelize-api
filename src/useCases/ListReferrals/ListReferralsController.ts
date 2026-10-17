import type { Request, Response } from "express";
import { REFERRAL_STATUSES, type ReferralStatus } from "@/entities/Referral";
import type { ListReferralsUseCase } from "./ListReferralsUseCase";

function parsePositiveInt(value: unknown, fallback: number): number {
	const parsed = Number.parseInt(String(value ?? fallback), 10);
	if (Number.isNaN(parsed) || parsed < 1) {
		return fallback;
	}
	return parsed;
}

function parseStatus(value: unknown): ReferralStatus | undefined {
	if (typeof value !== "string" || !value.trim()) {
		return undefined;
	}

	const status = value.trim().toUpperCase() as ReferralStatus;

	if (!REFERRAL_STATUSES.includes(status)) {
		throw new Error("Status de indicação inválido");
	}

	return status;
}

export class ListReferralsController {
	constructor(private listReferralsUseCase: ListReferralsUseCase) {}

	async handle(request: Request, response: Response): Promise<Response> {
		try {
			const page = parsePositiveInt(request.query.page, 1);
			const perPage = parsePositiveInt(request.query.perPage, 10);
			const status = parseStatus(request.query.status);
			const referrerId =
				typeof request.query.referrerId === "string"
					? request.query.referrerId
					: undefined;

			const result = await this.listReferralsUseCase.execute({
				page,
				perPage,
				status,
				referrerId,
			});

			return response.status(200).json(result);
		} catch (err: unknown) {
			return response.status(400).json({
				message: (err as Error).message || "Unexpected error",
			});
		}
	}
}
