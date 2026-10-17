import { beforeEach, describe, expect, it, vi } from "vitest";
import { Customer } from "@/entities/Customer";
import { Referral } from "@/entities/Referral";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { IReferralsRepository } from "@/repositories/IReferralsRepository";
import { CreateReferralUseCase } from "./CreateReferralUseCase";

describe("CreateReferralUseCase", () => {
	let referralsRepository: IReferralsRepository;
	let customersRepository: ICustomersRepository;
	let sut: CreateReferralUseCase;

	const referrer = new Customer(
		{
			name: "Maria",
			phone: "11999990001",
			dateOfBirth: null,
			leadSource: "OUTRO",
		},
		"referrer-id",
	);

	const referred = new Customer(
		{
			name: "João",
			phone: "11999990002",
			dateOfBirth: null,
			leadSource: "INDICACAO",
		},
		"referred-id",
	);

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
		customersRepository = {
			findByPhone: vi.fn(),
			findActiveById: vi.fn(),
			save: vi.fn(),
			list: vi.fn(),
			update: vi.fn(),
			deactivate: vi.fn(),
		};
		sut = new CreateReferralUseCase(
			referralsRepository,
			customersRepository,
		);
	});

	it("registra indicação pendente quando dados são válidos", async () => {
		vi.mocked(referralsRepository.findByReferredId).mockResolvedValue(null);
		vi.mocked(customersRepository.findActiveById).mockImplementation(
			async (id) => {
				if (id === "referrer-id") {
					return referrer;
				}
				if (id === "referred-id") {
					return referred;
				}
				return null;
			},
		);

		await sut.execute({
			referrerId: "referrer-id",
			referredId: "referred-id",
		});

		expect(referralsRepository.save).toHaveBeenCalledTimes(1);
		const savedReferral = vi.mocked(referralsRepository.save).mock
			.calls[0]?.[0];
		expect(savedReferral).toBeInstanceOf(Referral);
		expect(savedReferral?.status).toBe("PENDING");
		expect(savedReferral?.referrerId).toBe("referrer-id");
		expect(savedReferral?.referredId).toBe("referred-id");
	});

	it("rejeita autoindicação", async () => {
		await expect(
			sut.execute({
				referrerId: "same-id",
				referredId: "same-id",
			}),
		).rejects.toThrow("Indicador e indicado devem ser clientes diferentes");

		expect(referralsRepository.save).not.toHaveBeenCalled();
	});

	it("rejeita quando o cliente já foi indicado", async () => {
		vi.mocked(referralsRepository.findByReferredId).mockResolvedValue(
			new Referral({
				referrerId: "other",
				referredId: "referred-id",
				status: "PENDING",
				convertedAt: null,
			}),
		);

		await expect(
			sut.execute({
				referrerId: "referrer-id",
				referredId: "referred-id",
			}),
		).rejects.toThrow("Este cliente já foi indicado");

		expect(referralsRepository.save).not.toHaveBeenCalled();
	});
});
