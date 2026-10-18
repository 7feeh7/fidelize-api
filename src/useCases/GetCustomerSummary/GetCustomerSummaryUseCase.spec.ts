import { beforeEach, describe, expect, it, vi } from "vitest";
import { Customer } from "@/entities/Customer";
import type { IAppointmentsRepository } from "@/repositories/IAppointmentsRepository";
import type { ICustomerRewardsRepository } from "@/repositories/ICustomerRewardsRepository";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { IReturnRemindersRepository } from "@/repositories/IReturnRemindersRepository";
import { GetCustomerSummaryUseCase } from "./GetCustomerSummaryUseCase";

describe("GetCustomerSummaryUseCase", () => {
	let customersRepository: ICustomersRepository;
	let appointmentsRepository: IAppointmentsRepository;
	let returnRemindersRepository: IReturnRemindersRepository;
	let customerRewardsRepository: ICustomerRewardsRepository;
	let sut: GetCustomerSummaryUseCase;

	beforeEach(() => {
		customersRepository = {
			save: vi.fn(),
			findByPhone: vi.fn(),
			findActiveById: vi.fn(),
			findActiveProfileById: vi.fn(),
			list: vi.fn(),
			update: vi.fn(),
			deactivate: vi.fn(),
		};
		appointmentsRepository = {
			saveWithItems: vi.fn(),
			updateWithItems: vi.fn(),
			findById: vi.fn(),
			findDetailById: vi.fn(),
			list: vi.fn(),
			countByCustomerId: vi.fn(),
			getStatsByCustomerId: vi.fn(),
		};
		returnRemindersRepository = {
			findNextSuggestedReturnDueDate: vi.fn(),
			listEligibleForReminders: vi.fn(),
		};
		customerRewardsRepository = {
			save: vi.fn(),
			existsByGrantKey: vi.fn(),
			existsBirthdayGrantForYear: vi.fn(),
			findById: vi.fn(),
			findDetailById: vi.fn(),
			findUsedDetailByAppointmentId: vi.fn(),
			expireAvailablePastDue: vi.fn(),
			listByCustomerId: vi.fn(),
			listAvailableExpiringWithinDays: vi.fn(),
			findSoonestExpiringAvailable: vi.fn(),
			update: vi.fn(),
		};
		sut = new GetCustomerSummaryUseCase(
			customersRepository,
			appointmentsRepository,
			returnRemindersRepository,
			customerRewardsRepository,
		);
	});

	it("returns customer profile with visit indicators", async () => {
		vi.mocked(customersRepository.findActiveProfileById).mockResolvedValue({
			customer: new Customer(
				{
					name: "Ana Lima",
					phone: "85999990001",
					dateOfBirth: "1992-10-17",
					leadSource: "INDICACAO",
					active: true,
				},
				"cust-1",
			),
			referrerId: "ref-1",
			referrerName: "Maria",
			referralsMadeCount: 2,
		});
		vi.mocked(appointmentsRepository.getStatsByCustomerId).mockResolvedValue({
			totalVisits: 4,
			totalSpent: 320,
			lastVisitDate: "2026-10-01",
		});
		vi.mocked(
			returnRemindersRepository.findNextSuggestedReturnDueDate,
		).mockResolvedValue("2026-11-01");
		vi.mocked(
			customerRewardsRepository.listAvailableExpiringWithinDays,
		).mockResolvedValue([]);

		const result = await sut.execute("cust-1");

		expect(result.name).toBe("Ana Lima");
		expect(result.indicators.totalVisits).toBe(4);
		expect(result.indicators.totalSpent).toBe(320);
		expect(result.indicators.averageTicket).toBe(80);
		expect(result.indicators.lastVisitDate).toBe("2026-10-01");
		expect(result.indicators.daysSinceLastVisit).toBeGreaterThanOrEqual(0);
		expect(result.nextSuggestedReturnDate).toBe("2026-11-01");
	});

	it("throws when customer is not found", async () => {
		vi.mocked(customersRepository.findActiveProfileById).mockResolvedValue(
			null,
		);

		await expect(sut.execute("missing")).rejects.toThrow(
			"Cliente não encontrado",
		);
	});
});
