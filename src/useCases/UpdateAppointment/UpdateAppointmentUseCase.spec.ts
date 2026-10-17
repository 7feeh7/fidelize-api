import { beforeEach, describe, expect, it, vi } from "vitest";
import { Appointment } from "@/entities/Appointment";
import { Customer } from "@/entities/Customer";
import { Service } from "@/entities/Service";
import { User } from "@/entities/User";
import type { IAppointmentsRepository } from "@/repositories/IAppointmentsRepository";
import type { ICustomersRepository } from "@/repositories/ICustomersRepository";
import type { IServicesRepository } from "@/repositories/IServicesRepository";
import type { IUsersRepository } from "@/repositories/IUsersRepository";
import { UpdateAppointmentUseCase } from "./UpdateAppointmentUseCase";

describe("UpdateAppointmentUseCase", () => {
	let appointmentsRepository: IAppointmentsRepository;
	let customersRepository: ICustomersRepository;
	let servicesRepository: IServicesRepository;
	let usersRepository: IUsersRepository;
	let sut: UpdateAppointmentUseCase;

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
		sut = new UpdateAppointmentUseCase(
			appointmentsRepository,
			customersRepository,
			servicesRepository,
			usersRepository,
		);
	});

	it("atualiza atendimento recalculando valores e datas de retorno", async () => {
		const existing = new Appointment(
			{
				customerId: "customer-id",
				userId: "user-id",
				appointmentDate: new Date("2026-10-01T10:00:00.000Z"),
				subtotal: 50,
				discountAmount: 0,
				total: 50,
				notes: null,
			},
			"appointment-id",
		);

		vi.mocked(appointmentsRepository.findById).mockResolvedValue(existing);
		vi.mocked(customersRepository.findActiveById).mockResolvedValue(
			new Customer(
				{
					name: "Maria",
					phone: "11999990000",
					dateOfBirth: null,
					leadSource: "INSTAGRAM",
					active: true,
				},
				"customer-id",
			),
		);
		vi.mocked(usersRepository.findById).mockResolvedValue(
			new User(
				{ name: "Pro", email: "a@b.com", password: "hash" },
				"user-id",
			),
		);
		vi.mocked(servicesRepository.findActiveById).mockResolvedValue(
			new Service(
				{
					name: "Escova",
					description: null,
					price: 70,
					durationMinutes: null,
					suggestedReturnDays: 15,
					active: true,
				},
				"service-id",
			),
		);

		await sut.execute({
			id: "appointment-id",
			customerId: "customer-id",
			appointmentDate: "2026-10-20T15:00:00.000Z",
			loggedUserId: "user-id",
			discountAmount: 5,
			items: [{ serviceId: "service-id", price: 75 }],
		});

		expect(appointmentsRepository.updateWithItems).toHaveBeenCalledTimes(1);

		const [appointment, items] = vi.mocked(
			appointmentsRepository.updateWithItems,
		).mock.calls[0] ?? [];

		expect(appointment?.subtotal).toBe(75);
		expect(appointment?.total).toBe(70);
		expect(items?.[0]?.returnDueDate).toBe("2026-11-04");
	});

	it("lança erro quando o atendimento não existe", async () => {
		vi.mocked(appointmentsRepository.findById).mockResolvedValue(null);

		await expect(
			sut.execute({
				id: "missing",
				customerId: "customer-id",
				appointmentDate: "2026-10-20T15:00:00.000Z",
				loggedUserId: "user-id",
				items: [{ serviceId: "service-id", price: 75 }],
			}),
		).rejects.toThrow("Atendimento não encontrado");
	});
});
