import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IReturnRemindersRepository } from "@/repositories/IReturnRemindersRepository";
import {
	LIST_OVERDUE_RETURNS_MAX_PER_PAGE,
	ListOverdueReturnsUseCase,
} from "./ListOverdueReturnsUseCase";

describe("ListOverdueReturnsUseCase", () => {
	let returnRemindersRepository: IReturnRemindersRepository;
	let sut: ListOverdueReturnsUseCase;

	beforeEach(() => {
		returnRemindersRepository = {
			listEligibleForReminders: vi.fn(),
			listOverdueWithoutContactAfterAppointment: vi.fn(),
			findNextSuggestedReturnDueDate: vi.fn(),
		};
		sut = new ListOverdueReturnsUseCase(returnRemindersRepository);
	});

	it("retorna retornos vencidos paginados com dias de atraso", async () => {
		vi.mocked(
			returnRemindersRepository.listOverdueWithoutContactAfterAppointment,
		).mockResolvedValue({
			total: 1,
			items: [
				{
					appointmentItemId: "item-1",
					customerId: "customer-1",
					customerName: "Ana Souza",
					customerPhone: "85999990000",
					serviceName: "Hidratação",
					appointmentDate: "2026-08-28",
					returnDueDate: "2026-09-27",
					additionalServicesCount: 1,
				},
			],
		});

		const referenceDate = new Date("2026-10-16T12:00:00.000Z");

		const result = await sut.execute({ page: 1, perPage: 5 }, referenceDate);

		expect(
			returnRemindersRepository.listOverdueWithoutContactAfterAppointment,
		).toHaveBeenCalledWith("2026-10-16", 1, LIST_OVERDUE_RETURNS_MAX_PER_PAGE);
		expect(result).toEqual({
			page: 1,
			totalPages: 1,
			data: [
				{
					customerId: "customer-1",
					customerName: "Ana Souza",
					customerPhone: "85999990000",
					serviceName: "Hidratação",
					appointmentDate: "2026-08-28",
					returnDueDate: "2026-09-27",
					overdueDays: 19,
					additionalServicesCount: 1,
				},
			],
		});
	});

	it("limita o tamanho da página ao máximo permitido", async () => {
		vi.mocked(
			returnRemindersRepository.listOverdueWithoutContactAfterAppointment,
		).mockResolvedValue({ total: 0, items: [] });

		await sut.execute({ page: 1, perPage: 20 }, new Date("2026-10-16T12:00:00.000Z"));

		expect(
			returnRemindersRepository.listOverdueWithoutContactAfterAppointment,
		).toHaveBeenCalledWith("2026-10-16", 1, LIST_OVERDUE_RETURNS_MAX_PER_PAGE);
	});
});
