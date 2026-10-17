import { beforeEach, describe, expect, it, vi } from "vitest";
import { Customer } from "@/entities/Customer";
import { Service } from "@/entities/Service";
import { User } from "@/entities/User";
import type { IAppointmentsRepository } from "@/repositories/IAppointmentsRepository";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { IServicesRepository } from "@/repositories/IServicesRepository";
import type { IReferralsRepository } from "@/repositories/IReferralsRepository";
import type { IUsersRepository } from "@/repositories/IUsersRepository";
import { CreateAppointmentUseCase } from "./CreateAppointmentUseCase";

describe("CreateAppointmentUseCase", () => {
	let appointmentsRepository: IAppointmentsRepository;
	let customersRepository: ICustomersRepository;
	let servicesRepository: IServicesRepository;
	let usersRepository: IUsersRepository;
	let referralsRepository: IReferralsRepository;
	let sut: CreateAppointmentUseCase;

	const activeCustomer = new Customer(
		{
			name: "Maria",
			phone: "11999990000",
			dateOfBirth: null,
			leadSource: "INSTAGRAM",
			active: true,
		},
		"customer-id",
	);

	const activeService = new Service(
		{
			name: "Corte",
			description: null,
			price: 80,
			durationMinutes: 60,
			suggestedReturnDays: 30,
			active: true,
		},
		"service-id",
	);

	const loggedUser = new User(
		{
			name: "Profissional",
			email: "pro@salon.com",
			password: "hash",
		},
		"user-id",
	);

	beforeEach(() => {
		appointmentsRepository = {
			saveWithItems: vi.fn(),
			updateWithItems: vi.fn(),
			findById: vi.fn(),
			findDetailById: vi.fn(),
			list: vi.fn(),
			countByCustomerId: vi.fn(),
		};
		customersRepository = {
			findByPhone: vi.fn(),
			findActiveById: vi.fn(),
			save: vi.fn(),
			list: vi.fn(),
			update: vi.fn(),
			deactivate: vi.fn(),
		};
		servicesRepository = {
			save: vi.fn(),
			findByName: vi.fn(),
			findActiveById: vi.fn(),
			listAll: vi.fn(),
			deactivate: vi.fn(),
		};
		usersRepository = {
			save: vi.fn(),
			findByEmail: vi.fn(),
			findById: vi.fn(),
			listAll: vi.fn(),
		};
		referralsRepository = {
			save: vi.fn(),
			findByReferredId: vi.fn(),
			findById: vi.fn(),
			update: vi.fn(),
			list: vi.fn(),
			countByReferrerId: vi.fn(),
			convertPendingByReferredId: vi.fn(),
		};
		sut = new CreateAppointmentUseCase(
			appointmentsRepository,
			customersRepository,
			servicesRepository,
			usersRepository,
			referralsRepository,
		);
		vi.mocked(appointmentsRepository.countByCustomerId).mockResolvedValue(1);
	});

	it("registra atendimento calculando subtotal, total e data de retorno", async () => {
		vi.mocked(customersRepository.findActiveById).mockResolvedValue(
			activeCustomer,
		);
		vi.mocked(usersRepository.findById).mockResolvedValue(loggedUser);
		vi.mocked(servicesRepository.findActiveById).mockResolvedValue(
			activeService,
		);

		await sut.execute({
			customerId: "customer-id",
			appointmentDate: "2026-10-17T14:30:00.000Z",
			loggedUserId: "user-id",
			discountAmount: 10,
			items: [{ serviceId: "service-id", price: 90 }],
		});

		expect(appointmentsRepository.saveWithItems).toHaveBeenCalledTimes(1);

		const [appointment, items] = vi.mocked(
			appointmentsRepository.saveWithItems,
		).mock.calls[0] ?? [];

		expect(appointment?.subtotal).toBe(90);
		expect(appointment?.discountAmount).toBe(10);
		expect(appointment?.total).toBe(80);
		expect(appointment?.userId).toBe("user-id");
		expect(items?.[0]?.returnDueDate).toBe("2026-11-16");
		expect(referralsRepository.convertPendingByReferredId).toHaveBeenCalledWith(
			"customer-id",
			new Date("2026-10-17T14:30:00.000Z"),
		);
	});

	it("não converte indicação quando não é o primeiro atendimento", async () => {
		vi.mocked(customersRepository.findActiveById).mockResolvedValue(
			activeCustomer,
		);
		vi.mocked(usersRepository.findById).mockResolvedValue(loggedUser);
		vi.mocked(servicesRepository.findActiveById).mockResolvedValue(
			activeService,
		);
		vi.mocked(appointmentsRepository.countByCustomerId).mockResolvedValue(2);

		await sut.execute({
			customerId: "customer-id",
			appointmentDate: "2026-10-17T14:30:00.000Z",
			loggedUserId: "user-id",
			items: [{ serviceId: "service-id", price: 80 }],
		});

		expect(
			referralsRepository.convertPendingByReferredId,
		).not.toHaveBeenCalled();
	});

	it("usa o usuário logado quando nenhum profissional é informado", async () => {
		vi.mocked(customersRepository.findActiveById).mockResolvedValue(
			activeCustomer,
		);
		vi.mocked(usersRepository.findById).mockResolvedValue(loggedUser);
		vi.mocked(servicesRepository.findActiveById).mockResolvedValue(
			activeService,
		);

		await sut.execute({
			customerId: "customer-id",
			appointmentDate: "2026-10-17T14:30:00.000Z",
			loggedUserId: "user-id",
			items: [{ serviceId: "service-id", price: 80 }],
		});

		const [appointment] = vi.mocked(appointmentsRepository.saveWithItems).mock
			.calls[0] ?? [];
		expect(appointment?.userId).toBe("user-id");
	});

	it("lança erro quando o desconto é maior que o subtotal", async () => {
		vi.mocked(customersRepository.findActiveById).mockResolvedValue(
			activeCustomer,
		);
		vi.mocked(usersRepository.findById).mockResolvedValue(loggedUser);
		vi.mocked(servicesRepository.findActiveById).mockResolvedValue(
			activeService,
		);

		await expect(
			sut.execute({
				customerId: "customer-id",
				appointmentDate: "2026-10-17T14:30:00.000Z",
				loggedUserId: "user-id",
				discountAmount: 100,
				items: [{ serviceId: "service-id", price: 80 }],
			}),
		).rejects.toThrow("O desconto não pode ser maior que o subtotal");

		expect(appointmentsRepository.saveWithItems).not.toHaveBeenCalled();
	});

	it("lança erro quando não há serviços", async () => {
		vi.mocked(customersRepository.findActiveById).mockResolvedValue(
			activeCustomer,
		);
		vi.mocked(usersRepository.findById).mockResolvedValue(loggedUser);

		await expect(
			sut.execute({
				customerId: "customer-id",
				appointmentDate: "2026-10-17T14:30:00.000Z",
				loggedUserId: "user-id",
				items: [],
			}),
		).rejects.toThrow("Informe pelo menos um serviço");
	});

	it("lança erro quando o cliente não está ativo", async () => {
		vi.mocked(customersRepository.findActiveById).mockResolvedValue(null);

		await expect(
			sut.execute({
				customerId: "customer-id",
				appointmentDate: "2026-10-17T14:30:00.000Z",
				loggedUserId: "user-id",
				items: [{ serviceId: "service-id", price: 80 }],
			}),
		).rejects.toThrow("Cliente não encontrado");
	});
});
