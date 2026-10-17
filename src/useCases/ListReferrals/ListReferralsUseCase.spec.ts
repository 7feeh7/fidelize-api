import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IReferralsRepository } from "@/repositories/IReferralsRepository";
import { ListReferralsUseCase } from "./ListReferralsUseCase";

describe("ListReferralsUseCase", () => {
	let referralsRepository: IReferralsRepository;
	let sut: ListReferralsUseCase;

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
		sut = new ListReferralsUseCase(referralsRepository);
	});

	it("lista indicações com paginação", async () => {
		vi.mocked(referralsRepository.list).mockResolvedValue({
			items: [
				{
					id: "ref-1",
					referrerId: "a",
					referrerName: "Maria",
					referredId: "b",
					referredName: "João",
					status: "PENDING",
					createdAt: new Date("2026-01-01T12:00:00.000Z"),
					convertedAt: null,
				},
			],
			total: 1,
		});

		const result = await sut.execute({ page: 1, perPage: 10 });

		expect(referralsRepository.list).toHaveBeenCalledWith({
			page: 1,
			perPage: 10,
			status: undefined,
			referrerId: undefined,
		});
		expect(result.data).toHaveLength(1);
		expect(result.totalPages).toBe(1);
		expect(result.data[0]?.status).toBe("PENDING");
	});
});
