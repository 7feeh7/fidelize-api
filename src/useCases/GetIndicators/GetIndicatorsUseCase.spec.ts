import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IIndicatorsRepository } from "@/repositories/IIndicatorsRepository";
import { getTodayDateOnly } from "@/utils/getTodayDateOnly";
import { GetIndicatorsUseCase } from "./GetIndicatorsUseCase";

describe("GetIndicatorsUseCase", () => {
	let indicatorsRepository: IIndicatorsRepository;
	let sut: GetIndicatorsUseCase;

	beforeEach(() => {
		indicatorsRepository = {
			getTotals: vi.fn(),
		};
		sut = new GetIndicatorsUseCase(indicatorsRepository);
	});

	it("returns indicators for the requested date range", async () => {
		vi.mocked(indicatorsRepository.getTotals).mockResolvedValue({
			appointmentsCount: 181,
			billedAmount: 15566,
			newCustomersCount: 24,
			convertedReferralsCount: 6,
		});

		const today = getTodayDateOnly();
		const startDate = `${today.slice(0, 7)}-01`;

		const result = await sut.execute({
			startDate,
			endDate: today,
		});

		expect(indicatorsRepository.getTotals).toHaveBeenCalledWith(
			startDate,
			today,
		);
		expect(result).toEqual({
			startDate,
			endDate: today,
			appointmentsCount: 181,
			billedAmount: 15566,
			newCustomersCount: 24,
			convertedReferralsCount: 6,
		});
	});

	it("rejects invalid ranges", async () => {
		await expect(
			sut.execute({
				startDate: "2026-10-31",
				endDate: "2026-10-01",
			}),
		).rejects.toThrow("A data inicial deve ser anterior ou igual à data final");
	});
});
