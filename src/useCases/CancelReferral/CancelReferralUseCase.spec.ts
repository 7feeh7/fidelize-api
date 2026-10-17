import { beforeEach, describe, expect, it, vi } from "vitest";
import { Referral } from "@/entities/Referral";
import type { IReferralsRepository } from "@/repositories/IReferralsRepository";
import { CancelReferralUseCase } from "./CancelReferralUseCase";

describe("CancelReferralUseCase", () => {
	let referralsRepository: IReferralsRepository;
	let sut: CancelReferralUseCase;

	beforeEach(() => {
		referralsRepository = {
			save: vi.fn(),
			findByReferredId: vi.fn(),
			findById: vi.fn(),
			update: vi.fn(),
			list: vi.fn(),
			countByReferrerId: vi.fn(),
			convertPendingByReferredId: vi.fn(),
		};
		sut = new CancelReferralUseCase(referralsRepository);
	});

	it("cancela indicação pendente", async () => {
		const referral = new Referral(
			{
				referrerId: "referrer-id",
				referredId: "referred-id",
				status: "PENDING",
				convertedAt: null,
			},
			"referral-id",
		);

		vi.mocked(referralsRepository.findById).mockResolvedValue(referral);

		await sut.execute({ id: "referral-id" });

		expect(referralsRepository.update).toHaveBeenCalledTimes(1);
		const updatedReferral = vi.mocked(referralsRepository.update).mock
			.calls[0]?.[0];
		expect(updatedReferral?.status).toBe("CANCELED");
	});

	it("rejeita cancelamento de indicação convertida", async () => {
		vi.mocked(referralsRepository.findById).mockResolvedValue(
			new Referral(
				{
					referrerId: "referrer-id",
					referredId: "referred-id",
					status: "CONVERTED",
					convertedAt: new Date(),
				},
				"referral-id",
			),
		);

		await expect(sut.execute({ id: "referral-id" })).rejects.toThrow(
			"Somente indicações pendentes podem ser canceladas",
		);

		expect(referralsRepository.update).not.toHaveBeenCalled();
	});
});
