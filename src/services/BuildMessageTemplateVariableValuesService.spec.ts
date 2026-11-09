import { beforeEach, describe, expect, it, vi } from "vitest";
import { Tenant } from "@/entities/Tenant";
import type { IAppointmentsRepository } from "@/repositories/IAppointmentsRepository";
import type { ICustomerRewardsRepository } from "@/repositories/ICustomerRewardsRepository";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { ITenantsRepository } from "@/repositories/ITenantsRepository";
import { BuildMessageTemplateVariableValuesService } from "./BuildMessageTemplateVariableValuesService";

describe("BuildMessageTemplateVariableValuesService", () => {
	let tenantsRepository: ITenantsRepository;
	let sut: BuildMessageTemplateVariableValuesService;

	const customerRewardsRepository = {
		findSoonestExpiringAvailable: vi.fn().mockResolvedValue(null),
	} as unknown as ICustomerRewardsRepository;

	beforeEach(() => {
		tenantsRepository = {
			save: vi.fn(),
			findById: vi
				.fn()
				.mockResolvedValue(
					new Tenant(
						{ name: "Salão Teste", slug: "salao-teste", status: "ACTIVE" },
						"tenant-1",
					),
				),
			findBySlug: vi.fn(),
			listWithAccess: vi.fn(),
		};
		sut = new BuildMessageTemplateVariableValuesService(
			{} as ICustomersRepository,
			{} as IAppointmentsRepository,
			customerRewardsRepository,
			tenantsRepository,
		);
	});

	it("usa o nome do negócio na prévia sem cliente", async () => {
		const values = await sut.execute("tenant-1");

		expect(tenantsRepository.findById).toHaveBeenCalledWith("tenant-1");
		expect(values.negocio).toBe("Salão Teste");
	});

	it("rejeita negócio inexistente", async () => {
		vi.mocked(tenantsRepository.findById).mockResolvedValue(null);

		await expect(sut.execute("tenant-x")).rejects.toThrow(
			"Negócio não encontrado",
		);
	});

	it("lembrete de retorno usa o negócio recebido, sem nova consulta", async () => {
		const { variables } = await sut.buildForReturnReminder(
			{ id: "tenant-1", name: "Barbearia" },
			{
				customerId: "customer-1",
				customerName: "Maria Silva",
				serviceName: "Corte",
				appointmentDate: "2026-01-01",
				referenceDate: new Date("2026-01-11T12:00:00.000Z"),
			},
		);

		expect(variables.negocio).toBe("Barbearia");
		expect(tenantsRepository.findById).not.toHaveBeenCalled();
		expect(
			customerRewardsRepository.findSoonestExpiringAvailable,
		).toHaveBeenCalledWith("tenant-1", "customer-1");
	});
});
